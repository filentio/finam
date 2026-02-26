from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.common import APIModel


class HHResumeListItem(APIModel):
    id: str
    title: str | None = None
    updated_at: datetime | None = None


class HHResumeListOut(APIModel):
    items: list[HHResumeListItem]


class HHResumeCacheOut(APIModel):
    resume_id: str
    title: str | None = None
    cached_at: datetime


class HHResumeCachedOut(APIModel):
    resume_id: str
    title: str | None = None
    updated_at_from_hh: datetime | None = None
    normalized_text: str | None = None
    numbers_allowlist: list[str] = Field(default_factory=list)
    raw_json: dict | None = None

