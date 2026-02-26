from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ResumeExperienceItem(BaseModel):
    model_config = {"populate_by_name": True}

    company: str | None = None
    role: str | None = None
    from_: str | None = Field(default=None, alias="from")
    to: str | None = None
    description: str | None = None


class ResumeParsed(BaseModel):
    profession: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: list[ResumeExperienceItem] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class ResumeSourceOut(BaseModel):
    id: str
    source_type: str
    source_url: str | None = None
    file_name: str | None = None
    file_mime: str | None = None
    status: str
    error_code: str | None = None
    error_text: str | None = None
    created_at: datetime
    updated_at: datetime


class ResumeGetOut(BaseModel):
    exists: bool
    updated_at: datetime | None = None
    source: ResumeSourceOut | None = None
    parsed: ResumeParsed | None = None
    keywords: list[str] = Field(default_factory=list)
    numbers_allowlist: list[str] = Field(default_factory=list)
    raw_text: str | None = None


class ResumeFromUrlIn(BaseModel):
    url: str = Field(min_length=5, max_length=2000)


class ResumeStats(BaseModel):
    chars: int
    words: int


class ResumeImportOut(BaseModel):
    parsed: ResumeParsed
    stats: ResumeStats
    warnings: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    numbers_allowlist: list[str] = Field(default_factory=list)
    raw_text_preview: str | None = None

