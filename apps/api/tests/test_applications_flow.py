from __future__ import annotations


def test_application_draft_approve_send_idempotent(client, seeded_vacancy):
    # create draft
    r = client.post(
        "/api/v1/applications",
        json={"vacancy_id": seeded_vacancy["id"], "resume_id": "hh_resume_1", "cover_letter_id": None},
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

