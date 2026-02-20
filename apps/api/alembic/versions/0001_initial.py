"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-02-20

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    jsonb = postgresql.JSONB(astext_type=sa.Text())

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("display_name", sa.String(), nullable=True),
        sa.Column("role", sa.String(), nullable=False, server_default="user"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "hh_accounts",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hh_user_id", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="disconnected"),
        sa.Column("access_token_ciphertext", sa.Text(), nullable=False, server_default=""),
        sa.Column("refresh_token_ciphertext", sa.Text(), nullable=True),
        sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("scopes_json", jsonb, nullable=True),
        sa.Column("connected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("disconnected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_token_refresh_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", name="uq_hh_accounts_user_id"),
    )
    op.create_index("ix_hh_accounts_hh_user_id", "hh_accounts", ["hh_user_id"])

    op.create_table(
        "search_profiles",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("filters_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("stoplist_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("quiet_hours_json", jsonb, nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_search_profiles_user_id", "search_profiles", ["user_id"])
    op.create_index("ix_search_profiles_is_active", "search_profiles", ["is_active"])

    op.create_table(
        "vacancies",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("external_vacancy_id", sa.String(), nullable=False),
        sa.Column("hh_url", sa.Text(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("employer_id", sa.String(), nullable=True),
        sa.Column("employer_name", sa.String(), nullable=True),
        sa.Column("area_name", sa.String(), nullable=True),
        sa.Column("salary_from", sa.Integer(), nullable=True),
        sa.Column("salary_to", sa.Integer(), nullable=True),
        sa.Column("salary_currency", sa.String(), nullable=True),
        sa.Column("experience", sa.String(), nullable=True),
        sa.Column("employment", sa.String(), nullable=True),
        sa.Column("schedule", sa.String(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("apply_via_hh", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("external_apply_url", sa.Text(), nullable=True),
        sa.Column("raw_json", jsonb, nullable=True),
        sa.Column("raw_fetched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("source", "external_vacancy_id", name="uq_vacancies_source_external_id"),
    )
    op.create_index("ix_vacancies_employer_id", "vacancies", ["employer_id"])
    op.create_index("ix_vacancies_area_name", "vacancies", ["area_name"])
    op.create_index("ix_vacancies_source_published_at", "vacancies", ["source", "published_at"])
    op.create_index("ix_vacancies_apply_via_hh", "vacancies", ["apply_via_hh"])

    op.create_table(
        "matches",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("search_profile_id", sa.Uuid(), sa.ForeignKey("search_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vacancy_id", sa.Uuid(), sa.ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("score", sa.Numeric(6, 3), nullable=False, server_default=sa.text("0")),
        sa.Column("reasons_json", jsonb, nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("search_profile_id", "vacancy_id", name="uq_matches_profile_vacancy"),
    )
    op.create_index("ix_matches_user_id", "matches", ["user_id"])
    op.create_index("ix_matches_search_profile_id", "matches", ["search_profile_id"])
    op.create_index("ix_matches_vacancy_id", "matches", ["vacancy_id"])
    op.create_index("ix_matches_profile_score", "matches", ["search_profile_id", "score"])
    op.create_index("ix_matches_user_computed_at", "matches", ["user_id", "computed_at"])

    op.create_table(
        "cover_templates",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("template_text", sa.Text(), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_cover_templates_is_default", "cover_templates", ["is_default"])

    op.create_table(
        "cover_letters",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vacancy_id", sa.Uuid(), sa.ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.String(), nullable=False),
        sa.Column("template_id", sa.Uuid(), sa.ForeignKey("cover_templates.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_cover_letters_user_id", "cover_letters", ["user_id"])
    op.create_index("ix_cover_letters_vacancy_id", "cover_letters", ["vacancy_id"])
    op.create_index("ix_cover_letters_user_updated_at", "cover_letters", ["user_id", "updated_at"])

    op.create_table(
        "applications",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vacancy_id", sa.Uuid(), sa.ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.String(), nullable=False),
        sa.Column("cover_letter_id", sa.Uuid(), sa.ForeignKey("cover_letters.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("queued_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("external_application_id", sa.String(), nullable=True),
        sa.Column("error_code", sa.String(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("last_attempt_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", "vacancy_id", "resume_id", name="uq_applications_user_vacancy_resume"),
    )
    op.create_index("ix_applications_user_id", "applications", ["user_id"])
    op.create_index("ix_applications_user_created_at", "applications", ["user_id", "created_at"])
    op.create_index("ix_applications_user_status_updated_at", "applications", ["user_id", "status", "updated_at"])
    op.create_index("ix_applications_vacancy_id", "applications", ["vacancy_id"])
    op.create_index("ix_applications_external_application_id", "applications", ["external_application_id"])

    op.create_table(
        "audit_log",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("metadata_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_audit_log_user_id", "audit_log", ["user_id"])
    op.create_index("ix_audit_log_action", "audit_log", ["action"])
    op.create_index("ix_audit_log_entity_created_at", "audit_log", ["entity_type", "entity_id", "created_at"])
    op.create_index("ix_audit_log_user_created_at", "audit_log", ["user_id", "created_at"])
    op.create_index("ix_audit_log_action_created_at", "audit_log", ["action", "created_at"])

    op.create_table(
        "idempotency_keys",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scope", sa.String(), nullable=False),
        sa.Column("key", sa.String(), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("request_hash", sa.String(), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("response_json", jsonb, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "scope", "key", name="uq_idempotency_user_scope_key"),
    )
    op.create_index("ix_idempotency_user_id", "idempotency_keys", ["user_id"])
    op.create_index("ix_idempotency_entity_id", "idempotency_keys", ["entity_id"])
    op.create_index("ix_idempotency_expires_at", "idempotency_keys", ["expires_at"])


def downgrade() -> None:
    op.drop_table("idempotency_keys")
    op.drop_table("audit_log")
    op.drop_table("applications")
    op.drop_table("cover_letters")
    op.drop_table("cover_templates")
    op.drop_table("matches")
    op.drop_table("vacancies")
    op.drop_table("search_profiles")
    op.drop_table("hh_accounts")
    op.drop_table("users")

