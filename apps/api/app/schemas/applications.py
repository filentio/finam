from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel


class ApplicationCreateIn(APIModel):
    vacancy_id: UUID
    resume_id: str = Field(min_length=1, max_length=200)
    cover_letter_id: UUID | None = None


class ApplicationOut(APIModel):
    id: UUID
    status: str
    vacancy_id: UUID
    resume_id: str
    cover_letter_id: UUID | None = None
    approved_at: datetime | None = None
    queued_at: datetime | None = None
    sent_at: datetime | None = None
    failed_at: datetime | None = None
    hh_negotiation_id: str | None = None
    error_code: str | None = None
    error_message: str | None = None
    last_attempt_at: datetime | None = None
    attempt_count: int
    created_at: datetime


class ApplicationListOut(APIModel):
    items: list[ApplicationOut]
    next_cursor: str | None = None

