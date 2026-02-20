from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel


class SearchProfileCreate(APIModel):
    name: str = Field(min_length=1, max_length=200)
    filters: dict[str, Any] = Field(default_factory=dict)
    stoplist: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class SearchProfileUpdate(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    filters: dict[str, Any] | None = None
    stoplist: dict[str, Any] | None = None
    is_active: bool | None = None


class SearchProfileOut(APIModel):
    id: UUID
    name: str
    is_active: bool
    filters: dict[str, Any]
    stoplist: dict[str, Any]
    updated_at: datetime


class SearchProfileList(APIModel):
    items: list[SearchProfileOut]


class RunOut(APIModel):
    run_id: UUID
    status: str = "queued"

