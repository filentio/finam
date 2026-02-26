from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, Text, UniqueConstraint, Index, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._types import JSON_VARIANT


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (
        UniqueConstraint("search_profile_id", "vacancy_id", name="uq_matches_profile_vacancy"),
        Index("ix_matches_profile_score", "search_profile_id", "score"),
        Index("ix_matches_user_computed_at", "user_id", "computed_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    search_profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("search_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vacancy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False, index=True)

    score: Mapped[float] = mapped_column(Numeric(6, 3), nullable=False, default=0)
    reasons_json: Mapped[list[dict]] = mapped_column(JSON_VARIANT, nullable=False, default=list)
    missing_skills_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)
    is_blocked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    blocked_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

