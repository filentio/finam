from __future__ import annotations

import httpx

from app.models.vacancy import Vacancy


def test_run_search_profile_ingests_vacancies_and_upserts(client, mocker):
    # Create search profile
    r = client.post(
        "/api/v1/search-profiles",
        json={"name": "Test", "filters": {"text": "python"}, "stoplist": {"companies": [], "keywords": []}, "is_active": True},
    )
    assert r.status_code == 201
    profile_id = r.json()["id"]

    # Mock HH /vacancies search
    calls = {"n": 0}

    async def fake_get(self, url, params=None, headers=None, **kwargs):  # noqa: ANN001
        # HHApiClient uses base_url + "/vacancies"
        assert str(url).endswith("/vacancies")
        calls["n"] += 1
        title = "Python Developer" if calls["n"] == 1 else "Python Developer UPDATED"
        return httpx.Response(
            status_code=200,
            json={
                "items": [
                    {
                        "id": "100",
                        "name": title,
                        "alternate_url": "https://hh.ru/vacancy/100",
                        "published_at": "2026-02-20T10:00:00+0300",
                        "employer": {"id": "10", "name": "ACME"},
                        "area": {"id": "1", "name": "Москва"},
                        "salary": {"from": 200000, "to": None, "currency": "RUR"},
                    }
                ],
                "page": 0,
                "pages": 1,
                "per_page": 20,
                "found": 1,
            },
        )

    mocker.patch("httpx.AsyncClient.get", new=fake_get)

    # Run ingestion
    r2 = client.post(f"/api/v1/search-profiles/{profile_id}/run")
    assert r2.status_code == 202

    # Vacancies list for profile includes ingested item
    r3 = client.get("/api/v1/vacancies", params={"search_profile_id": profile_id})
    assert r3.status_code == 200
    items = r3.json()["items"]
    assert len(items) == 1
    assert items[0]["external_vacancy_id"] == "100"
    assert items[0]["title"].startswith("Python Developer")

    # Second run should upsert vacancy without creating duplicates
    r4 = client.post(f"/api/v1/search-profiles/{profile_id}/run")
    assert r4.status_code == 202

    r5 = client.get("/api/v1/vacancies", params={"search_profile_id": profile_id})
    assert r5.status_code == 200
    items2 = r5.json()["items"]
    assert len(items2) == 1
    assert items2[0]["title"] == "Python Developer UPDATED"

    # Verify DB has exactly one vacancy row for external id
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        cnt = db.query(Vacancy).count()
        assert cnt == 1

