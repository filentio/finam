from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from app.schemas.common import APIModel


class MatchReason(APIModel):
    type: str  # positive|negative|info
    code: str
    text: str


class VacancyListItem(APIModel):
    id: UUID
    source: str
    external_vacancy_id: str
    title: str
    employer_name: str | None = None
    area_name: str | None = None
    salary_from: int | None = None
    salary_to: int | None = None
    published_at: datetime | None = None
    apply_via_hh: bool
    external_apply_url: str | None = None
    score: float | None = None
    is_blocked: bool = False
    blocked_reason: str | None = None
    reasons: list[MatchReason] = []


class VacancyListOut(APIModel):
    items: list[VacancyListItem]
    next_cursor: str | None = None


class VacancyDetailOut(APIModel):
    id: UUID
    source: str
    external_vacancy_id: str
    hh_url: str | None = None
    title: str
    employer_id: str | None = None
    employer_name: str | None = None
    area_name: str | None = None
    apply_via_hh: bool
    external_apply_url: str | None = None
    normalized: dict[str, Any] = {}


class MatchCreateIn(APIModel):
    search_profile_id: UUID


class MatchOut(APIModel):
    id: UUID
    vacancy_id: UUID
    search_profile_id: UUID
    score: float
    reasons: list[MatchReason]
    missing_skills: list[str] | None = None
    is_blocked: bool
    blocked_reason: str | None = None


class CoverLetterGenerateIn(APIModel):
    resume_id: str
    template_id: UUID | None = None
    tone: str | None = None

