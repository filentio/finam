"""applications response status fields

Revision ID: 0006_applications_response_status_fields
Revises: 0004_candidate_profiles_and_cover_letter_metadata
Create Date: 2026-02-20

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0006_applications_response_status_fields"
down_revision = "0004_candidate_profiles_and_cover_letter_metadata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    jsonb = postgresql.JSONB(astext_type=sa.Text())

    op.add_column("applications", sa.Column("response_status", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("response_payload_json", jsonb, nullable=True))
    op.add_column("applications", sa.Column("response_updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("applications", sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("applications", sa.Column("sync_error_code", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("sync_error_text", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("applications", "sync_error_text")
    op.drop_column("applications", "sync_error_code")
    op.drop_column("applications", "last_synced_at")
    op.drop_column("applications", "response_updated_at")
    op.drop_column("applications", "response_payload_json")
    op.drop_column("applications", "response_status")

