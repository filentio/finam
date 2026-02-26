from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel


class DefaultResumeIn(APIModel):
    resume_id: str | None = Field(default=None, min_length=1, max_length=200)


class DefaultResumeOut(APIModel):
    resume_id: str | None

