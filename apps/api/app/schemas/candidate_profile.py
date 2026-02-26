from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel


class CandidateLink(APIModel):
    type: str = Field(min_length=1, max_length=50)
    url: str = Field(min_length=1, max_length=2000)


class CandidateProfileUpsertIn(APIModel):
    full_name: str | None = Field(default=None, max_length=200)
    desired_role: str | None = Field(default=None, max_length=200)
    summary: str | None = Field(default=None, max_length=5000)
    skills_json: list[str] | None = None
    achievements_json: list[str] | None = None
    links_json: list[CandidateLink] | None = None
    facts_numbers_json: list[str] | None = None


class CandidateProfileOut(APIModel):
    id: UUID
    full_name: str | None = None
    desired_role: str | None = None
    summary: str | None = None
    skills_json: list[str] | None = None
    achievements_json: list[str] | None = None
    links_json: list[CandidateLink] | None = None
    facts_numbers_json: list[str] | None = None
    updated_at: datetime

