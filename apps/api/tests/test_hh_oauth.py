from __future__ import annotations

from urllib.parse import parse_qs, urlparse

import httpx

from app.models.hh_account import HHAccount


def _extract_qs(location: str) -> dict[str, str]:
    parsed = urlparse(location)
    qs = parse_qs(parsed.query)
    return {k: v[0] for k, v in qs.items() if v}


def test_hh_auth_start_redirect(client):
    r = client.get("/api/v1/auth/hh/start", follow_redirects=False)
    assert r.status_code == 302
    location = r.headers["location"]
    assert location.startswith("https://hh.ru/oauth/authorize?")

    qs = _extract_qs(location)
    assert qs["response_type"] == "code"
    assert qs["client_id"] == "test_client_id"
    assert qs["redirect_uri"] == "http://localhost:8000/api/v1/auth/hh/callback"
    assert qs.get("state")


def test_hh_auth_callback_success_and_status_and_disconnect(client, mocker):
    # Start -> get state
    r = client.get("/api/v1/auth/hh/start", follow_redirects=False)
    state = _extract_qs(r.headers["location"])["state"]

    async def fake_post(self, url, data=None, **kwargs):  # noqa: ANN001
        assert url == "https://hh.ru/oauth/token"
        assert data["grant_type"] == "authorization_code"
        assert data["client_id"] == "test_client_id"
        assert data["client_secret"] == "test_client_secret"
        assert data["redirect_uri"] == "http://localhost:8000/api/v1/auth/hh/callback"
        assert data["code"] == "code_abc"
        return httpx.Response(
            status_code=200,
            json={
                "access_token": "access_123",
                "token_type": "bearer",
                "expires_in": 3600,
                "refresh_token": "refresh_456",
                "scope": "scope1 scope2",
            },
        )

    mocker.patch("httpx.AsyncClient.post", new=fake_post)

    # Callback
    r2 = client.get("/api/v1/auth/hh/callback", params={"code": "code_abc", "state": state})
    assert r2.status_code == 200
    assert r2.json()["connected"] is True

    # HH account saved in DB
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        acc = db.query(HHAccount).one_or_none()
        assert acc is not None
        assert acc.status == "active"
        assert acc.access_token_ciphertext == "access_123"
        assert acc.refresh_token_ciphertext == "refresh_456"
        assert acc.token_expires_at is not None
        assert acc.scopes_json == ["scope1", "scope2"]

    # State is one-time
    assert client.app.state.redis.get(f"hh:oauth_state:{state}") is None

    # Status shows connected (no tokens)
    r3 = client.get("/api/v1/auth/hh/status")
    assert r3.status_code == 200
    s = r3.json()
    assert s["connected"] is True
    assert s["account_status"] == "active"
    assert s["has_refresh_token"] is True
    assert "access_token" not in str(s).lower()

    # Disconnect revokes and clears tokens
    r4 = client.post("/api/v1/auth/hh/disconnect")
    assert r4.status_code == 200
    assert r4.json()["connected"] is False

    with session_local() as db:
        acc2 = db.query(HHAccount).one()
        assert acc2.status == "revoked"
        assert acc2.access_token_ciphertext == ""
        assert acc2.refresh_token_ciphertext is None
        assert acc2.token_expires_at is None
