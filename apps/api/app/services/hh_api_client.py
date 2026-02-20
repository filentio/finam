from __future__ import annotations

import asyncio
import logging
import random
from dataclasses import dataclass
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class HHApiError(RuntimeError):
    pass


class HHApiUnavailable(HHApiError):
    pass


class HHApiRequestFailed(HHApiError):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code


class HHApiApplyFailed(HHApiRequestFailed):
    def __init__(self, status_code: int, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(status_code, message)
        self.details = details or {}


@dataclass(frozen=True)
class HHApiClient:
    base_url: str = "https://api.hh.ru"
    timeout_seconds: float = 10.0
    max_retries: int = 4

    def _headers(self, access_token: str | None) -> dict[str, str]:
        headers = {
            "Accept": "application/json",
            "User-Agent": "hh-mvp-api/0.1",
        }
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"
        return headers

    async def _get_json(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        access_token: str | None = None,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        timeout = httpx.Timeout(self.timeout_seconds, connect=5.0)
        backoff = 0.5

        for attempt in range(1, self.max_retries + 2):
            try:
                async with httpx.AsyncClient(base_url=self.base_url, timeout=timeout) as client:
                    resp = await client.get(path, params=params, headers=self._headers(access_token))
            except httpx.RequestError:
                if attempt > self.max_retries:
                    raise HHApiUnavailable("Network error calling HH API.")
                sleep_s = backoff * (2 ** (attempt - 1)) + random.random() * 0.1
                logger.warning(
                    "HH API network error, retrying",
                    extra={"request_id": request_id, "attempt": attempt, "sleep_s": sleep_s},
                )
                await asyncio.sleep(sleep_s)
                continue

            if resp.status_code == 429:
                if attempt > self.max_retries:
                    raise HHApiRequestFailed(429, "HH rate limited (429).")
                retry_after = resp.headers.get("Retry-After")
                if retry_after and retry_after.isdigit():
                    sleep_s = float(retry_after)
                else:
                    sleep_s = backoff * (2 ** (attempt - 1)) + random.random() * 0.2
                logger.warning(
                    "HH API rate limited, retrying",
                    extra={"request_id": request_id, "attempt": attempt, "sleep_s": sleep_s},
                )
                await asyncio.sleep(sleep_s)
                continue

            if 500 <= resp.status_code <= 599:
                if attempt > self.max_retries:
                    raise HHApiUnavailable(f"HH API unavailable ({resp.status_code}).")
                sleep_s = backoff * (2 ** (attempt - 1)) + random.random() * 0.2
                logger.warning(
                    "HH API 5xx, retrying",
                    extra={"request_id": request_id, "attempt": attempt, "status_code": resp.status_code, "sleep_s": sleep_s},
                )
                await asyncio.sleep(sleep_s)
                continue

            if resp.status_code >= 400:
                raise HHApiRequestFailed(resp.status_code, "HH API request failed.")

            return resp.json()

        raise HHApiUnavailable("HH API retries exhausted.")

    async def search_vacancies(self, params: dict[str, Any], access_token: str | None = None, request_id: str | None = None) -> dict[str, Any]:
        return await self._get_json("/vacancies", params=params, access_token=access_token, request_id=request_id)

    async def get_vacancy(self, vacancy_id: str, access_token: str | None = None, request_id: str | None = None) -> dict[str, Any]:
        return await self._get_json(f"/vacancies/{vacancy_id}", params=None, access_token=access_token, request_id=request_id)

    async def apply_to_vacancy(
        self,
        *,
        vacancy_id: str,
        resume_id: str,
        message: str,
        access_token: str,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Create applicant response (negotiation) for a vacancy.
        HH docs reference "apply-to-vacancy"; in practice this is handled via negotiations.
        We use POST /negotiations with form fields: vacancy_id, resume_id, message.
        """
        timeout = httpx.Timeout(self.timeout_seconds, connect=5.0)
        backoff = 0.5

        data = {
            "vacancy_id": vacancy_id,
            "resume_id": resume_id,
            "message": message,
        }

        for attempt in range(1, self.max_retries + 2):
            try:
                async with httpx.AsyncClient(base_url=self.base_url, timeout=timeout) as client:
                    resp = await client.post(
                        "/negotiations",
                        data=data,
                        headers={
                            **self._headers(access_token),
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    )
            except httpx.RequestError:
                if attempt > self.max_retries:
                    raise HHApiUnavailable("Network error calling HH apply.")
                sleep_s = backoff * (2 ** (attempt - 1)) + random.random() * 0.2
                logger.warning("HH apply network error, retrying", extra={"request_id": request_id, "attempt": attempt})
                await asyncio.sleep(sleep_s)
                continue

            if resp.status_code == 429:
                if attempt > self.max_retries:
                    raise HHApiApplyFailed(429, "HH rate limited (429).")
                retry_after = resp.headers.get("Retry-After")
                sleep_s = float(retry_after) if retry_after and retry_after.isdigit() else backoff * (2 ** (attempt - 1))
                logger.warning("HH apply rate limited, retrying", extra={"request_id": request_id, "attempt": attempt})
                await asyncio.sleep(sleep_s)
                continue

            if 500 <= resp.status_code <= 599:
                if attempt > self.max_retries:
                    raise HHApiUnavailable(f"HH apply unavailable ({resp.status_code}).")
                sleep_s = backoff * (2 ** (attempt - 1)) + random.random() * 0.2
                logger.warning("HH apply 5xx, retrying", extra={"request_id": request_id, "attempt": attempt})
                await asyncio.sleep(sleep_s)
                continue

            if resp.status_code >= 400:
                details = None
                try:
                    details = resp.json()
                except Exception:
                    details = {"text": resp.text[:200]}
                raise HHApiApplyFailed(resp.status_code, "HH apply failed.", details=details)

            # Success: parse negotiation id from Location header if present
            negotiation_id = None
            loc = resp.headers.get("Location") or resp.headers.get("location")
            if loc and "/negotiations/" in loc:
                negotiation_id = loc.rsplit("/", 1)[-1]

            raw_resp: dict[str, Any] = {}
            try:
                raw_resp = resp.json()
            except Exception:
                raw_resp = {}

            return {"negotiation_id": negotiation_id, "status": "created", "raw_response": raw_resp}

        raise HHApiUnavailable("HH apply retries exhausted.")

