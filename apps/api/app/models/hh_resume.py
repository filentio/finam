from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, Index, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._types import JSON_VARIANT


class HHResume(Base):
    __tablename__ = "hh_resumes"
    __table_args__ = (
        UniqueConstraint("user_id", "resume_id", name="uq_hh_resumes_user_resume_id"),
        Index("ix_hh_resumes_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    resume_id: Mapped[str] = mapped_column(String(200), nullable=False)
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    updated_at_from_hh: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    raw_json: Mapped[dict | None] = mapped_column(JSON_VARIANT, nullable=True)
    normalized_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    numbers_allowlist_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

