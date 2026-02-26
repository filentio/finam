from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel


class CoverLetterOut(APIModel):
    id: UUID
    status: str
    text: str
    version: int
    vacancy_id: UUID
    resume_id: str
    generated_at: datetime
    facts_used: list[str] | None = None
    numbers_used: list[str] | None = None
    risk_flags: list[str] | None = None
    validation: dict | None = None


class CoverLetterEditIn(APIModel):
    text: str = Field(min_length=1, max_length=20000)


class CoverLetterGenerateOut(APIModel):
    cover_letter_id: UUID
    letter_text: str
    status: str
    facts_used: list[str]
    numbers_used: list[str]
    risk_flags: list[str]
    validation: dict

