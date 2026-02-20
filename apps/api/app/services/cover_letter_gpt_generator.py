from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from app.models.candidate_profile import CandidateProfile
from app.models.cover_template import CoverTemplate
from app.models.vacancy import Vacancy
from app.services.openai_client import OpenAIResponsesClient
from app.settings import Settings


LETTER_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "letter_text": {"type": "string"},
        "facts_used": {"type": "array", "items": {"type": "string"}},
        "numbers_used": {"type": "array", "items": {"type": "string"}},
        "risk_flags": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["letter_text", "facts_used", "numbers_used", "risk_flags"],
    "additionalProperties": False,
}


def _vacancy_payload(v: Vacancy) -> dict[str, Any]:
    raw = v.raw_json or {}
    snippet = raw.get("snippet") if isinstance(raw, dict) else None
    requirement = ""
    responsibility = ""
    if isinstance(snippet, dict):
        requirement = str(snippet.get("requirement") or "")
        responsibility = str(snippet.get("responsibility") or "")
    return {
        "title": v.title,
        "company_name": v.employer_name,
        "area_name": v.area_name,
        "hh_url": v.hh_url,
        "requirements": requirement,
        "responsibilities": responsibility,
        "description": str(raw.get("description") or ""),
    }


def _candidate_payload(p: CandidateProfile) -> dict[str, Any]:
    return {
        "summary": p.summary or "",
        "skills": p.skills_json or [],
        "achievements": p.achievements_json or [],
        "links": p.links_json or [],
        "facts_numbers_allowlist": p.facts_numbers_json or [],
    }


def _template_payload(t: CoverTemplate | None) -> dict[str, Any]:
    if t is None:
        return {
            "template_text": (
                "Сформируй сопроводительное письмо на русском языке (1-2 абзаца) под вакансию. "
                "Стиль: {tone}. Не добавляй фактов, которых нет в профиле кандидата."
            )
        }
    return {"template_text": t.template_text}


@dataclass(frozen=True)
class CoverLetterGptGenerator:
    settings: Settings
    openai: OpenAIResponsesClient

    async def generate_cover_letter_gpt(
        self,
        *,
        vacancy: Vacancy,
        candidate_profile: CandidateProfile,
        template: CoverTemplate | None,
        tone: str = "neutral",
        request_id: str | None = None,
    ) -> dict[str, Any]:
        tone = tone if tone in {"formal", "neutral", "energetic"} else "neutral"

        instructions = (
            "Ты генерируешь сопроводительное письмо на русском языке.\n"
            "Правила (обязательные):\n"
            "- Не выдумывай факты о кандидате. Используй только данные из candidate_profile.\n"
            "- Любые числа (проценты, суммы, количества, сроки, 'X лет') можно использовать ТОЛЬКО если они есть в allowlist candidate_profile.facts_numbers_allowlist.\n"
            "- Если фактов не хватает, делай письмо нейтральным и добавляй риск-флаг NEEDS_MORE_FACTS.\n"
            "- Не включай спам/маркетинг.\n"
            "Верни результат строго по JSON Schema."
        )

        user_input = json.dumps(
            {
                "vacancy": _vacancy_payload(vacancy),
                "candidate_profile": _candidate_payload(candidate_profile),
                "template": _template_payload(template),
                "tone": tone,
            },
            ensure_ascii=False,
        )

        result = await self.openai.create_structured_json(
            instructions=instructions,
            user_input=user_input,
            schema_name="cover_letter",
            schema=LETTER_SCHEMA,
            request_id=request_id,
        )
        # Defensive normalization
        return {
            "letter_text": str(result.get("letter_text") or ""),
            "facts_used": list(result.get("facts_used") or []),
            "numbers_used": list(result.get("numbers_used") or []),
            "risk_flags": list(result.get("risk_flags") or []),
        }

