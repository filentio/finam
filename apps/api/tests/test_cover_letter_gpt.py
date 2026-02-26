from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

import httpx

from app.models.vacancy import Vacancy
from app.services.openai_client import OpenAIResponsesClient


def _seed_vacancy(client) -> str:
    session_local = client.app.state.SessionLocal
    with session_local() as db:
        v = Vacancy(
            id=uuid.uuid4(),
            source="hh",
            external_vacancy_id="777",
            title="Python Developer",
            employer_id="10",
            employer_name="ACME",
            area_name="Москва",
            raw_json={"snippet": {"requirement": "Python, FastAPI"}},
            published_at=datetime.now(timezone.utc),
            apply_via_hh=True,
        )
        db.add(v)
        db.commit()
        db.refresh(v)
        return str(v.id)


def _seed_resume(client, *, allowlist: list[str]):
    from app.models.resume import Resume

    session_local = client.app.state.SessionLocal
    with session_local() as db:
        user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        existing = db.query(Resume).filter(Resume.user_id == user_id).one_or_none()
        if existing is not None:
            db.delete(existing)
            db.commit()
        r = Resume(
            user_id=user_id,
            raw_text="Backend developer. Python, FastAPI.",
            parsed_json={"profession": "Backend developer", "skills": ["Python", "FastAPI"], "experience": [], "keywords": []},
            numbers_allowlist_json=allowlist,
        )
        db.add(r)
        db.commit()


def test_generate_requires_resume(client, mocker):
    vacancy_id = _seed_vacancy(client)
    # Mock OpenAI anyway (shouldn't be called)
    mocker.patch.object(OpenAIResponsesClient, "create_structured_json", autospec=True)

    r = client.post(
        f"/api/v1/vacancies/{vacancy_id}/cover-letter/generate",
        json={},
    )
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "RESUME_REQUIRED"


def test_generate_blocks_unverified_number(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_resume(client, allowlist=["15 лет"])

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

    r = client.post(
        f"/api/v1/vacancies/{vacancy_id}/cover-letter/generate",
        json={},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "draft_invalid"
    assert body["validation"]["is_valid"] is False
    assert any(e["error_code"] == "UNVERIFIED_NUMBER" for e in body["validation"]["errors"])


def test_generate_success_valid(client, mocker):
    vacancy_id = _seed_vacancy(client)
    _seed_resume(client, allowlist=["10 лет"])

    mocker.patch.object(
        OpenAIResponsesClient,
        "create_structured_json",
        autospec=True,
        return_value={
            "letter_text": "Здравствуйте! У меня 10 лет опыта в разработке на Python и FastAPI. Буду рад обсудить вакансию.",
            "facts_used": ["Python", "FastAPI"],
            "numbers_used": ["10 лет"],
            "risk_flags": [],
        },
    )

    r = client.post(
        f"/api/v1/vacancies/{vacancy_id}/cover-letter/generate",
        json={},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "draft"
    assert body["validation"]["is_valid"] is True


def test_structured_output_parsing(client, mocker):
    # Unit-test parsing of Responses API payload in OpenAIResponsesClient
    settings = client.app.state.settings
    c = OpenAIResponsesClient(settings=settings)

    async def fake_post(self, url, headers=None, json=None, **kwargs):  # noqa: ANN001
        assert url.endswith("/responses")
        return httpx.Response(
            status_code=200,
            json={
                "output": [
                    {
                        "type": "message",
                        "content": [
                            {
                                "type": "output_text",
                                "text": '{"letter_text":"ok","facts_used":[],"numbers_used":[],"risk_flags":[]}',
                            }
                        ],
                    }
                ]
            },
        )

    mocker.patch("httpx.AsyncClient.post", new=fake_post)
    parsed = asyncio.run(
        c.create_structured_json(
            instructions="x",
            user_input="y",
            schema_name="cover_letter",
            schema={
                "type": "object",
                "properties": {"letter_text": {"type": "string"}, "facts_used": {"type": "array", "items": {"type": "string"}}, "numbers_used": {"type": "array", "items": {"type": "string"}}, "risk_flags": {"type": "array", "items": {"type": "string"}}},
                "required": ["letter_text", "facts_used", "numbers_used", "risk_flags"],
                "additionalProperties": False,
            },
        )
    )
    assert parsed["letter_text"] == "ok"

