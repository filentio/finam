from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._types import JSON_VARIANT


class SearchProfile(Base):
    __tablename__ = "search_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String, nullable=False)
    filters_json: Mapped[dict] = mapped_column(JSON_VARIANT, nullable=False, default=dict)
    stoplist_json: Mapped[dict] = mapped_column(JSON_VARIANT, nullable=False, default=dict)
    quiet_hours_json: Mapped[dict | None] = mapped_column(JSON_VARIANT, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    # Stage R2: editable search template generated from resume
    generated_from_resume: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    template_json: Mapped[dict | None] = mapped_column(JSON_VARIANT, nullable=True)
    date_filter_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sort_mode: Mapped[str] = mapped_column(String(20), nullable=False, default="relevance")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

