from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models.vacancy import Vacancy


def _seed_profile(client, *, filters: dict, stoplist: dict) -> str:
    r = client.post(
        "/api/v1/search-profiles",
        json={"name": "P", "filters": filters, "stoplist": stoplist, "is_active": True},
    )
    assert r.status_code == 201
    return r.json()["id"]


def _seed_vacancy_db(client, **kwargs) -> str:
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        v = Vacancy(
            id=uuid.uuid4(),
            source="hh",
            external_vacancy_id=str(kwargs.get("external_vacancy_id", uuid.uuid4().int % 1000000)),
            title=kwargs.get("title", "Backend Python"),
            employer_id=kwargs.get("employer_id"),
            employer_name=kwargs.get("employer_name"),
            area_name=kwargs.get("area_name"),
            salary_from=kwargs.get("salary_from"),
            salary_to=kwargs.get("salary_to"),
            raw_json=kwargs.get("raw_json"),
            published_at=datetime.now(timezone.utc),
            apply_via_hh=True,
        )
        db.add(v)
        db.commit()
        db.refresh(v)
        return str(v.id)


def test_stoplist_blocks_company(client):
    vacancy_id = _seed_vacancy_db(client, employer_id="10", employer_name="ACME", title="Python Dev")
    profile_id = _seed_profile(client, filters={"text": "python"}, stoplist={"companies": ["10"], "keywords": []})

    r = client.post(f"/api/v1/vacancies/{vacancy_id}/match", json={"search_profile_id": profile_id})
    assert r.status_code == 200
    m = r.json()
    assert m["is_blocked"] is True
    assert m["score"] == 0
    assert m["blocked_reason"] in ("STOPLIST_COMPANY", "STOPLIST_KEYWORD")


def test_salary_rule_bonus_and_penalty(client):
    profile_id = _seed_profile(client, filters={"salary_min": 200000, "text": "python"}, stoplist={"companies": [], "keywords": []})

    v_good = _seed_vacancy_db(client, title="Python Dev", salary_from=250000, salary_to=None)
    v_bad = _seed_vacancy_db(client, title="Python Dev", salary_from=None, salary_to=150000)

    r1 = client.post(f"/api/v1/vacancies/{v_good}/match", json={"search_profile_id": profile_id})
    r2 = client.post(f"/api/v1/vacancies/{v_bad}/match", json={"search_profile_id": profile_id})
    assert r1.status_code == 200 and r2.status_code == 200
    assert r1.json()["score"] > r2.json()["score"]


def test_keyword_scoring_increases_score(client):
    profile_id = _seed_profile(client, filters={"keywords": ["python", "fastapi"]}, stoplist={"companies": [], "keywords": []})
    v1 = _seed_vacancy_db(client, title="Python FastAPI Developer", raw_json={"snippet": {"requirement": "FastAPI, Python"}})
    v2 = _seed_vacancy_db(client, title="Java Developer", raw_json={"snippet": {"requirement": "Spring"}})

    m1 = client.post(f"/api/v1/vacancies/{v1}/match", json={"search_profile_id": profile_id}).json()
    m2 = client.post(f"/api/v1/vacancies/{v2}/match", json={"search_profile_id": profile_id}).json()
    assert m1["score"] > m2["score"]


def test_vacancies_list_sorted_by_score(client):
    profile_id = _seed_profile(client, filters={"keywords": ["python"]}, stoplist={"companies": [], "keywords": []})
    v_hi = _seed_vacancy_db(client, title="Senior Python Developer")
    v_lo = _seed_vacancy_db(client, title="Support Specialist")

    client.post(f"/api/v1/vacancies/{v_lo}/match", json={"search_profile_id": profile_id})
    client.post(f"/api/v1/vacancies/{v_hi}/match", json={"search_profile_id": profile_id})

    r = client.get("/api/v1/vacancies", params={"search_profile_id": profile_id, "sort": "score"})
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) == 2
    assert items[0]["title"] == "Senior Python Developer"

