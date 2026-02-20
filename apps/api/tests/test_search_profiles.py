from __future__ import annotations


def test_create_and_list_search_profile(client):
    payload = {
        "name": "Python backend / Москва",
        "filters": {"text": "Python", "area": "Москва"},
        "stoplist": {"companies": ["123"], "keywords": ["вахта"]},
        "is_active": True,
    }
    r = client.post("/api/v1/search-profiles", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["filters"] == payload["filters"]
    assert data["stoplist"] == payload["stoplist"]

    r2 = client.get("/api/v1/search-profiles")
    assert r2.status_code == 200
    items = r2.json()["items"]
    assert len(items) == 1
    assert items[0]["id"] == data["id"]

