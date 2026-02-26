from __future__ import annotations

from typing import Any

from pydantic import Field

from app.schemas.common import APIModel


class SearchTemplateOut(APIModel):
    template_json: dict[str, Any]
    date_filter_days: int | None = None
    sort_mode: str = Field(default="relevance", pattern="^(relevance|date)$")


class SearchTemplateUpdateIn(APIModel):
    template_json: dict[str, Any]
    date_filter_days: int | None = Field(default=None, ge=1, le=365)
    sort_mode: str = Field(default="relevance", pattern="^(relevance|date)$")

