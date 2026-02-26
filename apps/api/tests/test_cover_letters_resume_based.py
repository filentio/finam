from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models.cover_letter import CoverLetter
from app.models.resume import Resume
from app.models.vacancy import Vacancy
from app.services.openai_client import OpenAIResponsesClient


def _seed_vacancy(client, *, with_description: bool = True) -> str:
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        v = Vacancy(
            id=uuid.uuid4(),
            source="hh_public",
            external_vacancy_id="777",
            title="Python Developer",
            employer_name="ACME",
            area_name="Москва",
            raw_json={"snippet": {"requirement": "Python, FastAPI"}, "description": ("We need Python" if with_description else "")},
            published_at=datetime.now(timezone.utc),
            apply_via_hh=False,
            external_apply_url="https://hh.ru/vacancy/777",
        )
        db.add(v)
        db.commit()
        db.refresh(v)
        return str(v.id)


def _seed_resume(client, *, allowlist: list[str]):
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        existing = db.query(Resume).filter(Resume.user_id == user_id).one_or_none()
        if existing is not None:
            db.delete(existing)
            db.commit()
        r = Resume(
            user_id=user_id,
            raw_text="Backend developer. 8 лет опыта. Python, FastAPI.",
            parsed_json={
                "profession": "Backend developer",
                "skills": ["Python", "FastAPI"],
                "experience": [{"company": "X", "role": "Dev", "from": "2020", "to": "2024", "description": "Did APIs"}],
                "keywords": ["python", "fastapi"],
            },
            numbers_allowlist_json=allowlist,
        )
        db.add(r)
        db.commit()


def test_generate_requires_resume(client, mocker):
    vacancy_id = _seed_vacancy(client)
    mocker.patch.object(OpenAIResponsesClient, "create_structured_json", autospec=True)

    r = client.post(f"/api/v1/vacancies/{vacancy_id}/cover-letter/generate", json={})
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "RESUME_REQUIRED"


def test_generate_blocks_unverified_number(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_resume(client, allowlist=["8 лет"])

    mocker.patch.object(
        OpenAIResponsesClient,
        "create_structured_json",
        autospec=True,
        return_value={
            "letter_text": "Здравствуйте! У меня 10 лет опыта в разработке на Python. Готов обсудить детали.",
            "facts_used": ["Python"],
            "numbers_used": ["10 лет"],
            "risk_flags": [],
        },
    )

    r = client.post(f"/api/v1/vacancies/{vacancy_id}/cover-letter/generate", json={"tone": "neutral"})
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "draft_invalid"
    assert body["validation"]["is_valid"] is False
    assert any(e["error_code"] == "UNVERIFIED_NUMBER" for e in body["validation"]["errors"])

    session_local = client.app.state.SessionLocal
    with session_local() as db:
        cl = db.get(CoverLetter, uuid.UUID(body["cover_letter_id"]))
        assert cl is not None
        assert str(cl.vacancy_id) == vacancy_id


def test_generate_success_valid_and_get_latest(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_resume(client, allowlist=["10 лет"])

    mocker.patch.object(
        OpenAIResponsesClient,
        "create_structured_json",
        autospec=True,
        side_effect=[
            {
                "letter_text": "Здравствуйте! У меня 10 лет опыта в разработке на Python и FastAPI.",
                "facts_used": ["Python", "FastAPI"],
                "numbers_used": ["10 лет"],
                "risk_flags": [],
            },
            {
                "letter_text": "Второе письмо без чисел.",
                "facts_used": ["Python"],
                "numbers_used": [],
                "risk_flags": [],
            },
        ],
    )

    r1 = client.post(f"/api/v1/vacancies/{vacancy_id}/cover-letter/generate", json={"tone": "neutral"})
    assert r1.status_code == 201
    assert r1.json()["status"] == "draft"

    r2 = client.post(f"/api/v1/vacancies/{vacancy_id}/cover-letter/generate", json={"tone": "neutral"})
    assert r2.status_code == 201

    last = client.get(f"/api/v1/vacancies/{vacancy_id}/cover-letter")
    assert last.status_code == 200
    assert last.json()["text"] == "Второе письмо без чисел."


def test_edit_revalidates(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_resume(client, allowlist=["10 лет"])

    mocker.patch.object(
        OpenAIResponsesClient,
        "create_structured_json",
        autospec=True,
        return_value={
            "letter_text": "Здравствуйте! У меня 10 лет опыта в разработке на Python и FastAPI.",
            "facts_used": ["Python", "FastAPI"],
            "numbers_used": ["10 лет"],
            "risk_flags": [],
        },
    )

    r = client.post(f"/api/v1/vacancies/{vacancy_id}/cover-letter/generate", json={})
    assert r.status_code == 201
    cl_id = r.json()["cover_letter_id"]

    # Make invalid by introducing unverified number.
    bad = client.put(f"/api/v1/cover-letters/{cl_id}", json={"text": "Опыт: 999% роста."})
    assert bad.status_code == 200
    assert bad.json()["status"] == "draft_invalid"
    assert bad.json()["validation"]["is_valid"] is False

    # Fix text (no new numbers)
    ok = client.put(f"/api/v1/cover-letters/{cl_id}", json={"text": "Здравствуйте! Мой опыт релевантен вакансии."})
    assert ok.status_code == 200
    assert ok.json()["status"] == "edited"

