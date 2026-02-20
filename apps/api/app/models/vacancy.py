from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models._types import JSON_VARIANT


class Vacancy(Base):
    __tablename__ = "vacancies"
    __table_args__ = (
        UniqueConstraint("source", "external_vacancy_id", name="uq_vacancies_source_external_id"),
        Index("ix_vacancies_source_published_at", "source", "published_at"),
        Index("ix_vacancies_apply_via_hh", "apply_via_hh"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    source: Mapped[str] = mapped_column(String, nullable=False)
    external_vacancy_id: Mapped[str] = mapped_column(String, nullable=False)

    hh_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    title: Mapped[str] = mapped_column(String, nullable=False)

    employer_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    employer_name: Mapped[str | None] = mapped_column(String, nullable=True)
    area_name: Mapped[str | None] = mapped_column(String, nullable=True, index=True)

    salary_from: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_to: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_currency: Mapped[str | None] = mapped_column(String, nullable=True)

    experience: Mapped[str | None] = mapped_column(String, nullable=True)
    employment: Mapped[str | None] = mapped_column(String, nullable=True)
    schedule: Mapped[str | None] = mapped_column(String, nullable=True)

    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    apply_via_hh: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    external_apply_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    raw_json: Mapped[dict | None] = mapped_column(JSON_VARIANT, nullable=True)
    raw_fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

