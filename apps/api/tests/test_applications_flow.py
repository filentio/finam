from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models.cover_letter import CoverLetter
from app.models.hh_account import HHAccount
from app.services.hh_api_client import HHApiClient

def test_application_draft_approve_send_idempotent(client, seeded_vacancy, mocker):
    # Mock HH apply to avoid network
    async def fake_apply(self, *, vacancy_id, resume_id, message, access_token, request_id=None):  # noqa: ANN001
        return {"negotiation_id": "123", "status": "created", "raw_response": {}}

    mocker.patch.object(HHApiClient, "apply_to_vacancy", autospec=True, side_effect=fake_apply)

    # Seed HH account and cover letter
    session_local = client.app.state.SessionLocal
    user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    with session_local() as db:
        acc = HHAccount(user_id=user_id, status="active", access_token_ciphertext="token")
        db.add(acc)
        cl = CoverLetter(
            user_id=user_id,
            vacancy_id=uuid.UUID(seeded_vacancy["id"]),
            resume_id="hh_resume_1",
            template_id=None,
            status="draft",
            text="Тестовое письмо без чисел.",
            version=1,
            generated_at=datetime.now(timezone.utc),
            validation_json={"is_valid": True, "errors": [], "warnings": []},
        )
        db.add(cl)
        db.commit()
        db.refresh(cl)
        cover_letter_id = str(cl.id)

    # create draft
    r = client.post(
        "/api/v1/applications",
        json={"vacancy_id": seeded_vacancy["id"], "resume_id": "hh_resume_1", "cover_letter_id": cover_letter_id},
    )
    assert r.status_code == 201
    app = r.json()
    assert app["status"] == "draft"

    # approve
    r2 = client.post(f"/api/v1/applications/{app['id']}/approve")
    assert r2.status_code == 200
    app2 = r2.json()
    assert app2["status"] == "approved"
    assert app2["approved_at"] is not None

    # send (queued)
    idem_key = "11111111-1111-1111-1111-111111111111"
    r3 = client.post(f"/api/v1/applications/{app['id']}/send", headers={"Idempotency-Key": idem_key})
    assert r3.status_code == 202
    body1 = r3.json()
    assert body1["status"] == "queued"

    # same key -> same result
    r4 = client.post(f"/api/v1/applications/{app['id']}/send", headers={"Idempotency-Key": idem_key})
    assert r4.status_code == r3.status_code
    body2 = r4.json()
    assert body2 == body1

