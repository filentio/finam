"""hh resumes cache and default resume

Revision ID: 0008_hh_resumes_and_default_resume
Revises: 0007_candidate_profile_identity_fields
Create Date: 2026-02-23

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0008_hh_resumes_and_default_resume"
down_revision = "0007_candidate_profile_identity_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    jsonb = postgresql.JSONB(astext_type=sa.Text())

    op.add_column("users", sa.Column("default_resume_id", sa.String(length=200), nullable=True))

    op.create_table(
        "hh_resumes",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.String(length=200), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=True),
        sa.Column("updated_at_from_hh", sa.DateTime(timezone=True), nullable=True),
        sa.Column("raw_json", jsonb, nullable=True),
        sa.Column("normalized_text", sa.Text(), nullable=True),
        sa.Column("numbers_allowlist_json", jsonb, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", "resume_id", name="uq_hh_resumes_user_resume_id"),
    )
    op.create_index("ix_hh_resumes_user_id", "hh_resumes", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_hh_resumes_user_id", table_name="hh_resumes")
    op.drop_table("hh_resumes")
    op.drop_column("users", "default_resume_id")

