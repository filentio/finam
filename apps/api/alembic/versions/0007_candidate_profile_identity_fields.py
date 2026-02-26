"""candidate profile identity fields

Revision ID: 0007_candidate_profile_identity_fields
Revises: 0006_applications_response_status_fields
Create Date: 2026-02-20

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0007_candidate_profile_identity_fields"
down_revision = "0006_applications_response_status_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("candidate_profiles", sa.Column("full_name", sa.String(length=200), nullable=True))
    op.add_column("candidate_profiles", sa.Column("desired_role", sa.String(length=200), nullable=True))


def downgrade() -> None:
    op.drop_column("candidate_profiles", "desired_role")
    op.drop_column("candidate_profiles", "full_name")

