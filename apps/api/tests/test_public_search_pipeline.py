from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.services.public_search_pipeline import run_search_profile_public_ingestion
from app.utils.stub_auth import get_or_create_stub_user
from app.models.search_profile import SearchProfile
from app.models.match import Match


def test_public_search_pipeline_inserts_and_filters_by_days(client: TestClient, mocker) -> None:
    # Avoid sleeps in public search.
    async def _nosleep(_s: float):
        return None

    mocker.patch("app.services.hh_public_search.asyncio.sleep", _nosleep)

    now = datetime.now(timezone.utc)
    recent_id = "123"
    old_id = "456"

    search_html = f"""
    <div data-qa="vacancy-serp__vacancy">
      <a data-qa="vacancy-serp__vacancy-title" href="https://hh.ru/vacancy/{recent_id}">Backend Python</a>
      <a data-qa="vacancy-serp__vacancy-employer">ACME</a>
      <span data-qa="vacancy-serp__vacancy-address">Москва</span>
      <span data-qa="vacancy-serp__vacancy-compensation">от 300 000 ₽</span>
      <span data-qa="vacancy-serp__vacancy-date">сегодня</span>
      <div data-qa="vacancy-serp__vacancy_snippet_requirement">Python SQL</div>
      <div data-qa="vacancy-serp__vacancy_snippet_responsibility">FastAPI</div>
    </div>
    <div data-qa="vacancy-serp__vacancy">
      <a data-qa="vacancy-serp__vacancy-title" href="https://hh.ru/vacancy/{old_id}">Support Specialist</a>
      <a data-qa="vacancy-serp__vacancy-employer">OldCo</a>
      <span data-qa="vacancy-serp__vacancy-date">вчера</span>
    </div>
    """

    recent_dt = (now - timedelta(days=1)).isoformat().replace("+00:00", "Z")
    old_dt = (now - timedelta(days=30)).isoformat().replace("+00:00", "Z")

    detail_recent = f'<time datetime="{recent_dt}"></time><div data-qa="vacancy-description">Python FastAPI SQL</div>'
    detail_old = f'<time datetime="{old_dt}"></time><div data-qa="vacancy-description">support call-center</div>'

    class _Resp:
        def __init__(self, status_code: int, text: str):
            self.status_code = status_code
            self.text = text

    class _Client:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url: str, params=None, headers=None):
            _ = params, headers
            if "search/vacancy" in url:
                return _Resp(200, search_html)
            if f"/vacancy/{recent_id}" in url:
                return _Resp(200, detail_recent)
            if f"/vacancy/{old_id}" in url:
                return _Resp(200, detail_old)
            return _Resp(404, "not found")

    mocker.patch("app.services.hh_public_search.httpx.AsyncClient", _Client)

    # Create profile with template + date_filter_days
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        user = get_or_create_stub_user(db)
        sp = SearchProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            name="from resume",
            filters_json={},
            stoplist_json={},
            is_active=True,
            generated_from_resume=True,
            template_json={"query": "python", "exclude_keywords": ["support", "call-center"], "must_have": ["python", "sql"]},
            date_filter_days=7,
            sort_mode="relevance",
        )
        db.add(sp)
        db.commit()

        out = asyncio.run(
            run_search_profile_public_ingestion(db=db, user_id=user.id, search_profile_id=sp.id, max_pages=1, detail_top_k=2)
        )
        assert out.ingested >= 2

        matches = db.query(Match).filter(Match.search_profile_id == sp.id).all()
        # Old vacancy should be filtered out by days cutoff (30 days old) => only 1 match expected
        assert len(matches) == 1

