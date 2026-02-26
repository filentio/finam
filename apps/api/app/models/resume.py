from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._types import JSON_VARIANT


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    # One resume per user (MVP).
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    active_source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resume_sources.id", ondelete="SET NULL"), nullable=True, index=True
    )

    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsed_json: Mapped[dict | None] = mapped_column(JSON_VARIANT, nullable=True)
    keywords_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)
    numbers_allowlist_json: Mapped[list[str] | None] = mapped_column(JSON_VARIANT, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

