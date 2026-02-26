from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models.application import Application
from app.models.cover_letter import CoverLetter
from app.models.hh_account import HHAccount
from app.models.vacancy import Vacancy
from app.services.hh_api_client import HHApiApplyFailed, HHApiClient


def _seed_vacancy(client) -> str:
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        v = Vacancy(
            id=uuid.uuid4(),
            source="hh",
            external_vacancy_id="999",
            title="Python Developer",
            employer_id="10",
            employer_name="ACME",
            area_name="Москва",
            published_at=datetime.now(timezone.utc),
            apply_via_hh=True,
        )
        db.add(v)
        db.commit()
        db.refresh(v)
        return str(v.id)


def _seed_cover_letter(client, vacancy_uuid: uuid.UUID, *, is_valid: bool, text: str) -> str:
    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        cl = CoverLetter(
            user_id=user_id,
            vacancy_id=vacancy_uuid,
            resume_id="hh_resume_1",
            status="draft" if is_valid else "draft_invalid",
            text=text,
            version=1,
            generated_at=datetime.now(timezone.utc),
            validation_json={"is_valid": is_valid, "errors": [] if is_valid else [{"error_code": "X", "message": "bad"}], "warnings": []},
        )
        db.add(cl)
        db.commit()
        db.refresh(cl)
        return str(cl.id)


def _seed_application_approved(client, vacancy_id: str, cover_letter_id: str) -> str:
    r = client.post(
        "/api/v1/applications",
        json={"vacancy_id": vacancy_id, "resume_id": "hh_resume_1", "cover_letter_id": cover_letter_id},
    )
    assert r.status_code == 201
    app_id = r.json()["id"]
    r2 = client.post(f"/api/v1/applications/{app_id}/approve")
    assert r2.status_code == 200
    assert r2.json()["status"] == "approved"
    return app_id


def _seed_hh_connected(client):
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


def test_send_requires_connected_hh(client):
    vacancy_id = _seed_vacancy(client)
    cl_id = _seed_cover_letter(client, uuid.UUID(vacancy_id), is_valid=True, text="Письмо.")
    app_id = _seed_application_approved(client, vacancy_id, cl_id)

    r = client.post(f"/api/v1/applications/{app_id}/send", headers={"Idempotency-Key": "k1"})
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "HH_NOT_CONNECTED"


def test_send_requires_valid_cover_letter(client):
    vacancy_id = _seed_vacancy(client)
    _seed_hh_connected(client)
    cl_id = _seed_cover_letter(client, uuid.UUID(vacancy_id), is_valid=False, text="У меня 10 лет опыта.")
    app_id = _seed_application_approved(client, vacancy_id, cl_id)

    r = client.post(f"/api/v1/applications/{app_id}/send", headers={"Idempotency-Key": "k2"})
    assert r.status_code == 422
    assert r.json()["detail"]["code"] == "COVER_LETTER_INVALID"


def test_send_success_sets_sent(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_hh_connected(client)
    cl_id = _seed_cover_letter(client, uuid.UUID(vacancy_id), is_valid=True, text="Письмо без чисел.")
    app_id = _seed_application_approved(client, vacancy_id, cl_id)

    async def fake_apply(self, *, vacancy_id, resume_id, message, access_token, request_id=None):  # noqa: ANN001
        return {"negotiation_id": "777", "status": "created", "raw_response": {}}

    mocker.patch.object(HHApiClient, "apply_to_vacancy", autospec=True, side_effect=fake_apply)

    r = client.post(f"/api/v1/applications/{app_id}/send", headers={"Idempotency-Key": "k3"})
    assert r.status_code == 202

    r2 = client.get(f"/api/v1/applications/{app_id}")
    assert r2.status_code == 200
    body = r2.json()
    assert body["status"] == "sent"
    assert body["hh_negotiation_id"] == "777"


def test_send_401_marks_failed_requires_reauth(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_hh_connected(client)
    cl_id = _seed_cover_letter(client, uuid.UUID(vacancy_id), is_valid=True, text="Письмо без чисел.")
    app_id = _seed_application_approved(client, vacancy_id, cl_id)

    async def fake_apply(self, *, vacancy_id, resume_id, message, access_token, request_id=None):  # noqa: ANN001
        raise HHApiApplyFailed(401, "unauthorized")

    mocker.patch.object(HHApiClient, "apply_to_vacancy", autospec=True, side_effect=fake_apply)

    r = client.post(f"/api/v1/applications/{app_id}/send", headers={"Idempotency-Key": "k4"})
    assert r.status_code == 202

    r2 = client.get(f"/api/v1/applications/{app_id}")
    assert r2.status_code == 200
    body = r2.json()
    assert body["status"] == "failed"
    assert body["error_code"] == "HH_UNAUTHORIZED"

    # HH account marked as reauth_required
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        acc = db.query(HHAccount).one()
        assert acc.status == "reauth_required"


def test_send_idempotency_calls_apply_once(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_hh_connected(client)
    cl_id = _seed_cover_letter(client, uuid.UUID(vacancy_id), is_valid=True, text="Письмо без чисел.")
    app_id = _seed_application_approved(client, vacancy_id, cl_id)

    async def fake_apply(self, *, vacancy_id, resume_id, message, access_token, request_id=None):  # noqa: ANN001
        return {"negotiation_id": "888", "status": "created", "raw_response": {}}

    spy = mocker.patch.object(HHApiClient, "apply_to_vacancy", autospec=True, side_effect=fake_apply)

    idem = "same-key"
    r1 = client.post(f"/api/v1/applications/{app_id}/send", headers={"Idempotency-Key": idem})
    r2 = client.post(f"/api/v1/applications/{app_id}/send", headers={"Idempotency-Key": idem})
    assert r1.status_code == 202 and r2.status_code == 202
    assert spy.call_count == 1


def test_local_rate_limit_blocks(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_hh_connected(client)
    cl_id = _seed_cover_letter(client, uuid.UUID(vacancy_id), is_valid=True, text="Письмо без чисел.")
    app_id = _seed_application_approved(client, vacancy_id, cl_id)

    # Pre-fill counters to hit limit on next incr
    now = datetime.now(timezone.utc)
    user_id = "00000000-0000-0000-0000-000000000001"
    day_key = f"hh:apply:day:{user_id}:{now.strftime('%Y%m%d')}"
    hour_key = f"hh:apply:hour:{user_id}:{now.strftime('%Y%m%d%H')}"
    client.app.state.redis.setex(day_key, 3600, str(client.app.state.settings.HH_APPLY_DAILY_LIMIT))
    client.app.state.redis.setex(hour_key, 3600, str(client.app.state.settings.HH_APPLY_HOURLY_LIMIT))

    spy = mocker.patch.object(HHApiClient, "apply_to_vacancy", autospec=True)

    r = client.post(f"/api/v1/applications/{app_id}/send", headers={"Idempotency-Key": "k5"})
    assert r.status_code == 202

    r2 = client.get(f"/api/v1/applications/{app_id}")
    assert r2.status_code == 200
    body = r2.json()
    assert body["status"] == "failed"
    assert body["error_code"] == "RATE_LIMIT_LOCAL"
    assert spy.call_count == 0

