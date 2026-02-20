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


class CoverLetterEditIn(APIModel):
    text: str = Field(min_length=1, max_length=20000)

