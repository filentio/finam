"""add match scoring fields

Revision ID: 0003_add_match_scoring_fields
Revises: 0001_initial
Create Date: 2026-02-20

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0003_add_match_scoring_fields"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    jsonb = postgresql.JSONB(astext_type=sa.Text())

    op.add_column("matches", sa.Column("missing_skills_json", jsonb, nullable=True))
    op.add_column("matches", sa.Column("is_blocked", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("matches", sa.Column("blocked_reason", sa.Text(), nullable=True))
    op.add_column(
        "matches",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_column("matches", "updated_at")
    op.drop_column("matches", "blocked_reason")
    op.drop_column("matches", "is_blocked")
    op.drop_column("matches", "missing_skills_json")

