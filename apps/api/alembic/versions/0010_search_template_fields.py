"""search template fields for public search

Revision ID: 0010_search_template_fields
Revises: 0009_resume_import_sources
Create Date: 2026-02-24

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0010_search_template_fields"
down_revision = "0009_resume_import_sources"
branch_labels = None
depends_on = None


def upgrade() -> None:
    jsonb = postgresql.JSONB(astext_type=sa.Text())

    op.add_column(
        "search_profiles",
        sa.Column("generated_from_resume", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column("search_profiles", sa.Column("template_json", jsonb, nullable=True))
    op.add_column("search_profiles", sa.Column("date_filter_days", sa.Integer(), nullable=True))
    op.add_column(
        "search_profiles",
        sa.Column("sort_mode", sa.String(length=20), nullable=False, server_default=sa.text("'relevance'")),
    )
    op.create_index("ix_search_profiles_generated_from_resume", "search_profiles", ["generated_from_resume"])


def downgrade() -> None:
    op.drop_index("ix_search_profiles_generated_from_resume", table_name="search_profiles")
    op.drop_column("search_profiles", "sort_mode")
    op.drop_column("search_profiles", "date_filter_days")
    op.drop_column("search_profiles", "template_json")
    op.drop_column("search_profiles", "generated_from_resume")

