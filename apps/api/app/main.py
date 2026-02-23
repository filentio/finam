from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import redis

from app.db.session import create_engine_from_url, create_sessionmaker
from app.routes import (
    applications_router,
    admin_sync_router,
    auth_hh_router,
    candidate_profile_router,
    cover_letters_router,
    hh_resumes_router,
    health_router,
    search_profiles_router,
    user_settings_router,
    vacancies_router,
)
from app.settings import Settings, get_settings
from app.services.state_store import InMemoryStateStore
from app.utils.logging import RequestIdFilter, configure_logging
from app.utils.request_id import RequestIdMiddleware


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.LOG_LEVEL)

    app = FastAPI(title="HH MVP API", version="0.1.0")
    app.state.settings = settings

    # DB
    engine = create_engine_from_url(settings.DATABASE_URL)
    app.state.engine = engine
    app.state.SessionLocal = create_sessionmaker(engine)

    # Redis (state store for OAuth)
    if settings.APP_ENV == "test":
        app.state.redis = InMemoryStateStore()
    else:
        app.state.redis = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

    # Middleware
    app.add_middleware(RequestIdMiddleware)
    if settings.CORS_ALLOW_ORIGINS:
        origins = [x.strip() for x in settings.CORS_ALLOW_ORIGINS.split(",") if x.strip()]
        allow_all = "*" in origins
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"] if allow_all else origins,
            allow_credentials=False if allow_all else True,
            allow_methods=["*"],
            allow_headers=["*"],
            expose_headers=["X-Request-Id"],
        )

    # Logging: ensure request_id field always exists
    logging.getLogger().addFilter(RequestIdFilter())

    # Routes
    app.include_router(health_router)
    app.include_router(auth_hh_router, prefix="/api/v1")
    app.include_router(candidate_profile_router, prefix="/api/v1")
    app.include_router(hh_resumes_router, prefix="/api/v1")
    app.include_router(user_settings_router, prefix="/api/v1")
    app.include_router(search_profiles_router, prefix="/api/v1")
    app.include_router(vacancies_router, prefix="/api/v1")
    app.include_router(cover_letters_router, prefix="/api/v1")
    app.include_router(applications_router, prefix="/api/v1")
    app.include_router(admin_sync_router, prefix="/api/v1")

    # Metrics
    Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

    return app


app = create_app()

