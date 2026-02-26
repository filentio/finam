from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ErrorDetail(APIModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class ErrorResponse(APIModel):
    error: ErrorDetail

