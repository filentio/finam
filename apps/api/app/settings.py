from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    APP_ENV: str = "dev"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/hh_mvp"
    REDIS_URL: str = "redis://localhost:6379/0"

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


@lru_cache
def get_settings() -> Settings:
    return Settings()

