from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._types import JSON_VARIANT


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    __table_args__ = (UniqueConstraint("user_id", name="uq_candidate_profiles_user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    full_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    desired_role: Mapped[str | None] = mapped_column(String(200), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    skills_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)
    achievements_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)
    links_json: Mapped[list[dict] | None] = mapped_column(JSON_VARIANT, nullable=True)

    # Allowlist of numbers/facts (e.g. ["15 лет", "3 проекта", "200 000 ₽"])
    facts_numbers_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

