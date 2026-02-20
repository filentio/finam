from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    APP_ENV: str = "dev"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/hh_mvp"
    REDIS_URL: str = "redis://localhost:6379/0"

    # HH OAuth placeholders (not used in stage 3 scaffold)
    HH_CLIENT_ID: str | None = None
    HH_CLIENT_SECRET: str | None = None
    HH_REDIRECT_URI: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()

