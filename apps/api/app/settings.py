from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    APP_ENV: str = "dev"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/hh_mvp"
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS (for local Next.js UI)
    # Comma-separated list, use "*" to allow all (credentials will be disabled).
    CORS_ALLOW_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # HH OAuth (stage 4)
    HH_CLIENT_ID: str | None = None
    HH_CLIENT_SECRET: str | None = None
    HH_REDIRECT_URI: str | None = None
    HH_OAUTH_AUTHORIZE_URL: str = "https://hh.ru/oauth/authorize"
    HH_OAUTH_TOKEN_URL: str = "https://hh.ru/oauth/token"

    AUTH_STATE_TTL_SECONDS: int = 600

    # Optional helper to build redirect_uri if HH_REDIRECT_URI is not set.
    PUBLIC_BASE_URL: str | None = None

    def get_hh_redirect_uri(self) -> str:
        if self.HH_REDIRECT_URI:
            return self.HH_REDIRECT_URI
        if self.PUBLIC_BASE_URL:
            return self.PUBLIC_BASE_URL.rstrip("/") + "/api/v1/auth/hh/callback"
        raise RuntimeError("HH_REDIRECT_URI (preferred) or PUBLIC_BASE_URL must be set.")

    # OpenAI (Stage 7)
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-5.2"
    OPENAI_TIMEOUT_SECONDS: int = 20

    COVER_LETTER_MIN_CHARS: int = 400
    COVER_LETTER_MAX_CHARS: int = 4000
    COVER_LETTER_FORBIDDEN_PHRASES: list[str] | None = None

    # HH apply (Stage 8) - local rate limits (conservative defaults)
    HH_APPLY_DAILY_LIMIT: int = 20
    HH_APPLY_HOURLY_LIMIT: int = 5
    HH_APPLY_MAX_RETRIES: int = 2

    # Stage 9 sync
    ADMIN_SYNC_TOKEN: str | None = None
    SYNC_INTERVAL_SECONDS: int = 900
    MAX_NEGOTIATIONS_PER_SYNC: int = 200


@lru_cache
def get_settings() -> Settings:
    return Settings()

