from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Index, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._types import JSON_VARIANT


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    __table_args__ = (
        UniqueConstraint("user_id", "scope", "key", name="uq_idempotency_user_scope_key"),
        Index("ix_idempotency_entity_id", "entity_id"),
        Index("ix_idempotency_expires_at", "expires_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    scope: Mapped[str] = mapped_column(String, nullable=False)
    key: Mapped[str] = mapped_column(String, nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(nullable=False)

    request_hash: Mapped[str] = mapped_column(String, nullable=False)

    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_json: Mapped[dict | None] = mapped_column(JSON_VARIANT, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

