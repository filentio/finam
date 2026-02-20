from __future__ import annotations

import asyncio
import json
import logging
import random
from dataclasses import dataclass
from typing import Any

import httpx

from app.settings import Settings

logger = logging.getLogger(__name__)


class OpenAIError(RuntimeError):
    pass


class OpenAIUnavailable(OpenAIError):
    pass


class OpenAIRequestFailed(OpenAIError):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code


def extract_output_text(payload: dict[str, Any]) -> str:
    """
    Responses API returns output as items, with content parts like:
      { "type": "output_text", "text": "..." }
    """
    out = payload.get("output") or []
    texts: list[str] = []
    if isinstance(out, list):
        for item in out:
            if not isinstance(item, dict):
                continue
            content = item.get("content") or []
            if not isinstance(content, list):
                continue
            for c in content:
                if not isinstance(c, dict):
                    continue
                if c.get("type") == "output_text" and isinstance(c.get("text"), str):
                    texts.append(c["text"])
    if texts:
        return "\n".join(texts).strip()
    # fallback for SDK-like conveniences if present
    if isinstance(payload.get("output_text"), str):
        return payload["output_text"].strip()
    return ""


@dataclass(frozen=True)
class OpenAIResponsesClient:
    settings: Settings
    base_url: str = "https://api.openai.com/v1"
    max_retries: int = 2

    async def create_structured_json(
        self,
        *,
        instructions: str,
        user_input: str,
        schema_name: str,
        schema: dict[str, Any],
        request_id: str | None = None,
    ) -> dict[str, Any]:
        if not self.settings.OPENAI_API_KEY:
            raise OpenAIRequestFailed(500, "OPENAI_API_KEY is not configured.")

        url = f"{self.base_url}/responses"
        headers = {
            "Authorization": f"Bearer {self.settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        body = {
            "model": self.settings.OPENAI_MODEL,
            "instructions": instructions,
            "input": user_input,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": schema_name,
                    "schema": schema,
                    "strict": True,
                },
            },
        }

        timeout = httpx.Timeout(float(self.settings.OPENAI_TIMEOUT_SECONDS), connect=5.0)
        backoff = 0.5

        for attempt in range(1, self.max_retries + 2):
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    resp = await client.post(url, headers=headers, json=body)
            except httpx.RequestError:
                if attempt > self.max_retries:
                    raise OpenAIUnavailable("Network error calling OpenAI.")
                sleep_s = backoff * (2 ** (attempt - 1)) + random.random() * 0.2
                logger.warning("OpenAI network error, retrying", extra={"request_id": request_id, "attempt": attempt})
                await asyncio.sleep(sleep_s)
                continue

            if 500 <= resp.status_code <= 599:
                if attempt > self.max_retries:
                    raise OpenAIUnavailable("OpenAI unavailable (5xx).")
                sleep_s = backoff * (2 ** (attempt - 1)) + random.random() * 0.2
                logger.warning(
                    "OpenAI 5xx, retrying",
                    extra={"request_id": request_id, "attempt": attempt, "status_code": resp.status_code},
                )
                await asyncio.sleep(sleep_s)
                continue

            if resp.status_code >= 400:
                raise OpenAIRequestFailed(resp.status_code, "OpenAI request failed.")

            payload = resp.json()
            text = extract_output_text(payload)
            if not text:
                raise OpenAIRequestFailed(502, "Empty OpenAI response.")

            try:
                parsed = json.loads(text)
            except json.JSONDecodeError as e:
                raise OpenAIRequestFailed(502, "Structured output is not valid JSON.") from e
            if not isinstance(parsed, dict):
                raise OpenAIRequestFailed(502, "Structured output is not a JSON object.")
            return parsed

        raise OpenAIUnavailable("OpenAI retries exhausted.")

