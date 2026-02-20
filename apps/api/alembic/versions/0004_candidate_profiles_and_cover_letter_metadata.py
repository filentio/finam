"""candidate profiles and cover letter metadata

Revision ID: 0004_candidate_profiles_and_cover_letter_metadata
Revises: 0003_add_match_scoring_fields
Create Date: 2026-02-20

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0004_candidate_profiles_and_cover_letter_metadata"
down_revision = "0003_add_match_scoring_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    jsonb = postgresql.JSONB(astext_type=sa.Text())

    op.create_table(
        "candidate_profiles",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("skills_json", jsonb, nullable=True),
        sa.Column("achievements_json", jsonb, nullable=True),
        sa.Column("links_json", jsonb, nullable=True),
        sa.Column("facts_numbers_json", jsonb, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", name="uq_candidate_profiles_user_id"),
    )
    op.create_index("ix_candidate_profiles_user_id", "candidate_profiles", ["user_id"])

    op.add_column("cover_letters", sa.Column("facts_used_json", jsonb, nullable=True))
    op.add_column("cover_letters", sa.Column("numbers_used_json", jsonb, nullable=True))
    op.add_column("cover_letters", sa.Column("risk_flags_json", jsonb, nullable=True))
    op.add_column("cover_letters", sa.Column("validation_json", jsonb, nullable=True))


def downgrade() -> None:
    op.drop_column("cover_letters", "validation_json")
    op.drop_column("cover_letters", "risk_flags_json")
    op.drop_column("cover_letters", "numbers_used_json")
    op.drop_column("cover_letters", "facts_used_json")

    op.drop_table("candidate_profiles")

