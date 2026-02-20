from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._types import JSON_VARIANT


class CoverLetter(Base):
    __tablename__ = "cover_letters"
    __table_args__ = (
        Index("ix_cover_letters_user_updated_at", "user_id", "updated_at"),
        Index("ix_cover_letters_vacancy_id", "vacancy_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vacancy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False)

    resume_id: Mapped[str] = mapped_column(String, nullable=False)
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("cover_templates.id", ondelete="SET NULL"), nullable=True
    )

    status: Mapped[str] = mapped_column(String, nullable=False, default="draft")  # draft/edited
    text: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    facts_used_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)
    numbers_used_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)
    risk_flags_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)
    validation_json: Mapped[dict | None] = mapped_column(JSON_VARIANT, nullable=True)

    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

