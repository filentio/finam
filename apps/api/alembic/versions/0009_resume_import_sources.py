"""resume import sources and parsed resume

Revision ID: 0009_resume_import_sources
Revises: 0008_hh_resumes_and_default_resume
Create Date: 2026-02-23

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0009_resume_import_sources"
down_revision = "0008_hh_resumes_and_default_resume"
branch_labels = None
depends_on = None


def upgrade() -> None:
    jsonb = postgresql.JSONB(astext_type=sa.Text())

    op.create_table(
        "resume_sources",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_type", sa.String(length=10), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("file_name", sa.String(length=500), nullable=True),
        sa.Column("file_mime", sa.String(length=200), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default=sa.text("'new'")),
        sa.Column("error_code", sa.String(length=100), nullable=True),
        sa.Column("error_text", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_resume_sources_user_id", "resume_sources", ["user_id"])
    op.create_index("ix_resume_sources_status", "resume_sources", ["status"])

    op.create_table(
        "resumes",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("active_source_id", sa.Uuid(), sa.ForeignKey("resume_sources.id", ondelete="SET NULL"), nullable=True),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("parsed_json", jsonb, nullable=True),
        sa.Column("keywords_json", jsonb, nullable=True),
        sa.Column("numbers_allowlist_json", jsonb, nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", name="uq_resumes_user_id"),
    )
    op.create_index("ix_resumes_user_id", "resumes", ["user_id"])
    op.create_index("ix_resumes_active_source_id", "resumes", ["active_source_id"])


def downgrade() -> None:
    op.drop_index("ix_resumes_active_source_id", table_name="resumes")
    op.drop_index("ix_resumes_user_id", table_name="resumes")
    op.drop_table("resumes")

    op.drop_index("ix_resume_sources_status", table_name="resume_sources")
    op.drop_index("ix_resume_sources_user_id", table_name="resume_sources")
    op.drop_table("resume_sources")

