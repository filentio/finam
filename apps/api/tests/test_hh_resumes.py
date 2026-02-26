from __future__ import annotations

import uuid

from app.models.hh_account import HHAccount
from app.models.hh_resume import HHResume
from app.models.user import User
from app.services.hh_api_client import HHApiClient


def _seed_hh_connected(client):
    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        u = db.get(User, user_id)
        if u is None:
            db.add(User(id=user_id, role="user"))
            db.commit()
        acc = db.query(HHAccount).filter(HHAccount.user_id == user_id).one_or_none()
        if acc:
            db.delete(acc)
            db.commit()
        db.add(HHAccount(user_id=user_id, status="active", access_token_ciphertext="token"))
        db.commit()


def test_list_resumes_requires_connected(client):
    r = client.get("/api/v1/hh/resumes")
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "HH_NOT_CONNECTED"


def test_list_resumes_returns_items(client, mocker):
    _seed_hh_connected(client)

    async def fake_list(self, *, access_token, request_id=None):  # noqa: ANN001
        assert access_token == "token"
        return {
            "items": [
                {"id": "r1", "title": "Backend Python", "updated_at": "2026-02-20T10:00:00+0300"},
                {"id": "r2", "title": "Data Engineer", "updated_at": "2026-02-19T12:00:00+0300"},
            ]
        }

    mocker.patch.object(HHApiClient, "list_resumes", autospec=True, side_effect=fake_list)

    r = client.get("/api/v1/hh/resumes")
    assert r.status_code == 200
    body = r.json()
    assert len(body["items"]) == 2
    assert body["items"][0]["id"] == "r1"


def test_cache_resume_saves_normalized_text_and_numbers_allowlist(client, mocker):
    _seed_hh_connected(client)

    raw = {
        "id": "r1",
        "title": "Backend Python",
        "updated_at": "2026-02-20T10:00:00+0300",
        "summary": "Опыт 5 лет. Увеличил конверсию на 20%.",
        "skill_set": ["Python", "FastAPI", "PostgreSQL"],
        "experience": [
            {
                "company": "ACME",
                "position": "Backend Engineer",
                "start": "2021-01-01",
                "end": "2026-01-01",
                "description": "Снизил latency на 30% и обработал 1 000 000 запросов.",
            }
        ],
    }

    async def fake_get(self, *, resume_id, access_token, request_id=None):  # noqa: ANN001
        assert resume_id == "r1"
        assert access_token == "token"
        return raw

    mocker.patch.object(HHApiClient, "get_resume", autospec=True, side_effect=fake_get)

    r = client.post("/api/v1/hh/resumes/r1/cache")
    assert r.status_code == 200

    r2 = client.get("/api/v1/hh/resumes/r1")
    assert r2.status_code == 200
    body = r2.json()
    assert body["resume_id"] == "r1"
    assert body["normalized_text"]
    nums = body["numbers_allowlist"]
    assert any("5" in x and ("лет" in x.lower() or "year" in x.lower()) for x in nums)
    assert any("%" in x for x in nums)

    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        rec = db.query(HHResume).filter(HHResume.user_id == user_id, HHResume.resume_id == "r1").one_or_none()
        assert rec is not None
        assert rec.normalized_text and "Backend Python" in rec.normalized_text
        assert rec.numbers_allowlist_json


def test_default_resume_used_when_creating_application_without_resume_id(client, seeded_vacancy):
    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        u = db.get(User, user_id)
        if u is None:
            u = User(id=user_id, role="user")
            db.add(u)
            db.commit()
        u.default_resume_id = "r_default"
        db.add(u)
        db.commit()

    r = client.post("/api/v1/applications", json={"vacancy_id": seeded_vacancy["id"]})
    assert r.status_code == 201
    assert r.json()["resume_id"] == "r_default"


def test_create_application_requires_resume_if_no_default(client, seeded_vacancy):
    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        u = db.get(User, user_id)
        if u is None:
            u = User(id=user_id, role="user")
            db.add(u)
            db.commit()
        u.default_resume_id = None
        db.add(u)
        db.commit()

    r = client.post("/api/v1/applications", json={"vacancy_id": seeded_vacancy["id"]})
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "RESUME_REQUIRED"

