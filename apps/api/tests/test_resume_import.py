from __future__ import annotations

import json

import pytest
from fastapi.testclient import TestClient


def test_from_url_not_public_redirect_to_login(client: TestClient, mocker) -> None:
    # Stub httpx.AsyncClient used inside fetch_public_resume_url to return 302 -> /login
    class _Resp:
        status_code = 302
        headers = {"location": "/login"}

        def __init__(self, url: str):
            self.url = url

        async def aiter_bytes(self):
            if False:  # pragma: no cover
                yield b""

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

    class _Client:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        def stream(self, method: str, url: str, headers=None):
            _ = method, headers
            return _Resp(url)

    mocker.patch("app.services.resume_text_extractor.httpx.AsyncClient", _Client)

    res = client.post("/api/v1/resume/from-url", json={"url": "https://example.com/resume"})
    assert res.status_code == 409
    body = res.json()
    assert body["detail"]["code"] == "RESUME_URL_NOT_PUBLIC"


def test_from_url_ok_saves_resume(client: TestClient, mocker) -> None:
    from app.services.resume_text_extractor import FetchedUrlContent

    html = """
    <html><head><title>Резюме</title></head>
    <body>
      <h1>Желаемая должность: Backend Developer</h1>
      <h2>Навыки</h2>
      <p>Python, SQL, FastAPI</p>
      <h2>Опыт работы</h2>
      <p>2021 — 2023</p>
      <p>ООО Рога и Копыта</p>
      <p>Backend Developer</p>
      <p>Снизил время ответа на 20%</p>
    </body></html>
    """

    async def _fake_fetch(url: str, **kwargs):
        _ = url, kwargs
        return FetchedUrlContent(final_url="https://example.com/resume", content_type="text/html", body=html.encode("utf-8"))

    mocker.patch("app.routes.resume_import.fetch_public_resume_url", _fake_fetch)

    res = client.post("/api/v1/resume/from-url", json={"url": "https://example.com/resume"})
    assert res.status_code == 200
    out = res.json()
    assert out["parsed"]["profession"] is not None
    assert "python" in [x.lower() for x in out["parsed"]["skills"]]
    assert any("20%" in x for x in out["numbers_allowlist"])

    res2 = client.get("/api/v1/resume?include_raw=true")
    assert res2.status_code == 200
    got = res2.json()
    assert got["exists"] is True
    assert got["raw_text"] and "Backend Developer" in got["raw_text"]


def test_upload_txt_ok(client: TestClient) -> None:
    text = "Желаемая должность: Product Analyst\nНавыки: SQL, Python\nОпыт работы\n2020 — 2022\nКомпания\nРоль\nРост конверсии на 15%"
    res = client.post("/api/v1/resume/upload", files={"file": ("cv.txt", text.encode("utf-8"), "text/plain")})
    assert res.status_code == 200
    out = res.json()
    assert out["parsed"]["profession"] is not None
    assert any("15%" in x for x in out["numbers_allowlist"])


def test_upload_pdf_uses_extractor_and_numbers_allowlist(client: TestClient, mocker) -> None:
    from app.services import resume_text_extractor as rte

    mocker.patch.object(rte, "extract_text_from_pdf", lambda b: "Желаемая должность: QA\nОпыт 8 лет\n20% улучшение")

    res = client.post("/api/v1/resume/upload", files={"file": ("cv.pdf", b"%PDF-1.4 fake", "application/pdf")})
    assert res.status_code == 200
    out = res.json()
    assert out["parsed"]["profession"] is not None
    assert any("8" in x for x in out["numbers_allowlist"])

