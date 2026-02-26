from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ResumeSource(Base):
    __tablename__ = "resume_sources"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # "url" | "file"
    source_type: Mapped[str] = mapped_column(String(10), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_mime: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # "new" | "fetched" | "parsed" | "failed"
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="new", index=True)
    error_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    error_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

