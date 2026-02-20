from __future__ import annotations

import sys
from pathlib import Path

# Ensure imports work when running pytest from repo root.
API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

import uuid
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.db.base import Base
from app.main import create_app
from app.models.vacancy import Vacancy
from app.settings import Settings


@pytest.fixture()
def client() -> TestClient:
    settings = Settings(
        DATABASE_URL="sqlite+pysqlite:///:memory:",
        APP_ENV="test",
        LOG_LEVEL="WARNING",
        HH_CLIENT_ID="test_client_id",
        HH_CLIENT_SECRET="test_client_secret",
        HH_REDIRECT_URI="http://localhost:8000/api/v1/auth/hh/callback",
        HH_OAUTH_AUTHORIZE_URL="https://hh.ru/oauth/authorize",
        HH_OAUTH_TOKEN_URL="https://hh.ru/oauth/token",
        AUTH_STATE_TTL_SECONDS=600,
    )
    app = create_app(settings)
    Base.metadata.create_all(bind=app.state.engine)
    return TestClient(app)


@pytest.fixture()
def seeded_vacancy(client: TestClient) -> dict:
    # Seed one vacancy directly via DB session
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        v = Vacancy(
            id=uuid.uuid4(),
            source="hh",
            external_vacancy_id="999999",
            title="Backend Developer (Python)",
            employer_name="Test",
            apply_via_hh=True,
            published_at=datetime.now(timezone.utc),
        )
        db.add(v)
        db.commit()
        db.refresh(v)
        return {"id": str(v.id)}

