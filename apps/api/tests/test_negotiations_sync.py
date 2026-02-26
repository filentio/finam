from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

import pytest

from app.models.application import Application
from app.models.hh_account import HHAccount
from app.services.hh_api_client import HHApiClient, HHApiRequestFailed
from app.services.negotiations_sync import sync_user_negotiations


def _seed_sent_application(client, negotiation_id: str) -> uuid.UUID:
    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        app = Application(
            user_id=user_id,
            vacancy_id=uuid.uuid4(),
            resume_id="hh_resume_1",
            status="sent",
            sent_at=datetime.now(timezone.utc),
            external_application_id=negotiation_id,
            attempt_count=0,
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        return app.id


def _seed_active_hh_account(client):
    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        existing = db.query(HHAccount).filter(HHAccount.user_id == user_id).one_or_none()
        if existing:
            db.delete(existing)
            db.commit()
        acc = HHAccount(user_id=user_id, status="active", access_token_ciphertext="token")
        db.add(acc)
        db.commit()


@pytest.mark.parametrize(
    "state_id,expected",
    [
        ("response", "pending"),
        ("consider", "pending"),
        ("phone_interview", "invited"),
        ("discard", "rejected"),
        ("hired", "closed"),
        ("unknown_state", "unknown"),
    ],
)
def test_sync_updates_response_status(client, mocker, state_id, expected):
    _seed_active_hh_account(client)
    app_id = _seed_sent_application(client, negotiation_id="123")

    async def fake_get_neg(self, *, negotiation_id, access_token, request_id=None):  # noqa: ANN001
        assert negotiation_id == "123"
        return {
            "id": "123",
            "state": {"id": state_id, "name": "x"},
            "updated_at": "2026-02-20T10:00:00+0300",
            "created_at": "2026-02-20T09:00:00+0300",
            "viewed_by_opponent": False,
            "has_updates": False,
            "messaging_status": "ok",
            "vacancy": {"id": "999", "name": "Dev"},
            "counters": {"messages": 1, "unread_messages": 0},
        }

    mocker.patch.object(HHApiClient, "get_negotiation", autospec=True, side_effect=fake_get_neg)

    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        stats = asyncio.run(sync_user_negotiations(db=db, user_id=user_id, max_items=10))
        assert stats.updated == 1
        a = db.get(Application, app_id)
        assert a.response_status == expected
        assert a.last_synced_at is not None
        assert a.response_payload_json["id"] == "123"


def test_sync_401_sets_reauth_required(client, mocker):
    _seed_active_hh_account(client)
    app_id = _seed_sent_application(client, negotiation_id="401")

    async def fake_get_neg(self, *, negotiation_id, access_token, request_id=None):  # noqa: ANN001
        raise HHApiRequestFailed(401, "unauthorized")

    mocker.patch.object(HHApiClient, "get_negotiation", autospec=True, side_effect=fake_get_neg)

    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        stats = asyncio.run(sync_user_negotiations(db=db, user_id=user_id, max_items=10))
        assert stats.unauthorized is True
        a = db.get(Application, app_id)
        assert a.sync_error_code == "HH_UNAUTHORIZED"
        acc = db.query(HHAccount).one()
        assert acc.status == "reauth_required"


def test_sync_rate_limit_429(client, mocker):
    _seed_active_hh_account(client)
    app_id = _seed_sent_application(client, negotiation_id="429")

    async def fake_get_neg(self, *, negotiation_id, access_token, request_id=None):  # noqa: ANN001
        raise HHApiRequestFailed(429, "rate")

    mocker.patch.object(HHApiClient, "get_negotiation", autospec=True, side_effect=fake_get_neg)

    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        stats = asyncio.run(sync_user_negotiations(db=db, user_id=user_id, max_items=10))
        assert stats.rate_limited is True
        a = db.get(Application, app_id)
        assert a.sync_error_code == "HH_RATE_LIMIT"


def test_sync_limits_max_items(client, mocker):
    _seed_active_hh_account(client)
    for i in range(0, 250):
        _seed_sent_application(client, negotiation_id=str(1000 + i))

    async def fake_get_neg(self, *, negotiation_id, access_token, request_id=None):  # noqa: ANN001
        return {
            "id": negotiation_id,
            "state": {"id": "response", "name": "x"},
            "updated_at": "2026-02-20T10:00:00+0300",
            "created_at": "2026-02-20T09:00:00+0300",
            "viewed_by_opponent": False,
            "has_updates": False,
            "messaging_status": "ok",
            "vacancy": {"id": "999", "name": "Dev"},
            "counters": {"messages": 1, "unread_messages": 0},
        }

    mocker.patch.object(HHApiClient, "get_negotiation", autospec=True, side_effect=fake_get_neg)

    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        stats = asyncio.run(sync_user_negotiations(db=db, user_id=user_id, max_items=200))
        assert stats.updated == 200
