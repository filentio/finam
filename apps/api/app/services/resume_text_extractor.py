from __future__ import annotations

import io
import re
from dataclasses import dataclass
from typing import Literal
from urllib.parse import urljoin

import httpx


MAX_FILE_BYTES = 10 * 1024 * 1024  # 10MB
MAX_URL_BYTES = 2 * 1024 * 1024  # 2MB (HTML or small files)
MAX_REDIRECTS = 3


class ResumeImportError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class ResumeUrlNotPublic(ResumeImportError):
    pass


class ResumeFetchFailed(ResumeImportError):
    pass


class TextExtractFailed(ResumeImportError):
    pass


class UnsupportedFileType(ResumeImportError):
    pass


@dataclass(frozen=True)
class FetchedUrlContent:
    final_url: str
    content_type: str
    body: bytes


def normalize_text(text: str) -> str:
    s = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    # Collapse spaces in lines, keep newlines as structure.
    s = "\n".join(re.sub(r"[ \t]+", " ", line).strip() for line in s.split("\n"))
    # Collapse excessive blank lines.
    s = re.sub(r"\n{3,}", "\n\n", s).strip()
    return s


def html_to_text(html: str) -> str:
    try:
        from bs4 import BeautifulSoup  # type: ignore
    except Exception as e:  # pragma: no cover
        raise TextExtractFailed("TEXT_EXTRACT_FAILED", f"Missing HTML parser dependency: {e}")

    soup = BeautifulSoup(html or "", "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    return normalize_text(text)


def extract_text_from_pdf(data: bytes) -> str:
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception as e:  # pragma: no cover
        raise TextExtractFailed("TEXT_EXTRACT_FAILED", f"Missing PDF parser dependency: {e}")

    try:
        reader = PdfReader(io.BytesIO(data))
        parts: list[str] = []
        for page in reader.pages:
            t = page.extract_text() or ""
            if t.strip():
                parts.append(t)
        return normalize_text("\n\n".join(parts))
    except ResumeImportError:
        raise
    except Exception as e:
        raise TextExtractFailed("TEXT_EXTRACT_FAILED", f"PDF extract failed: {e}")


def extract_text_from_docx(data: bytes) -> str:
    try:
        from docx import Document  # type: ignore
    except Exception as e:  # pragma: no cover
        raise TextExtractFailed("TEXT_EXTRACT_FAILED", f"Missing DOCX parser dependency: {e}")

    try:
        doc = Document(io.BytesIO(data))
        parts = [p.text for p in doc.paragraphs if p.text and p.text.strip()]
        return normalize_text("\n".join(parts))
    except ResumeImportError:
        raise
    except Exception as e:
        raise TextExtractFailed("TEXT_EXTRACT_FAILED", f"DOCX extract failed: {e}")


def extract_text_from_txt(data: bytes) -> str:
    try:
        # Try UTF-8 with BOM, then plain UTF-8, then cp1251.
        for enc in ("utf-8-sig", "utf-8", "cp1251"):
            try:
                return normalize_text(data.decode(enc))
            except Exception:
                continue
        return normalize_text(data.decode("utf-8", errors="ignore"))
    except Exception as e:
        raise TextExtractFailed("TEXT_EXTRACT_FAILED", f"TXT decode failed: {e}")


def _looks_like_login_redirect(location: str) -> bool:
    loc = (location or "").lower()
    return any(x in loc for x in ("/login", "signin", "auth", "oauth", "account/login"))


def _looks_like_resume_text(text: str) -> bool:
    t = (text or "").lower()
    if len(t) < 120:
        return False
    hints = [
        "резюме",
        "curriculum vitae",
        "опыт работы",
        "experience",
        "навыки",
        "skills",
        "образование",
        "education",
    ]
    return any(h in t for h in hints)


async def fetch_public_resume_url(
    url: str,
    *,
    timeout_seconds: float = 10.0,
    max_redirects: int = MAX_REDIRECTS,
    max_bytes: int = MAX_URL_BYTES,
) -> FetchedUrlContent:
    """
    Best-effort public URL validation:
    - no auth
    - fail on 401/403
    - treat redirects to login as NOT_PUBLIC
    - cap downloaded bytes
    """
    if not url or not isinstance(url, str):
        raise ResumeImportError("INVALID_URL", "Некорректный URL.")
    url = url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        raise ResumeImportError("INVALID_URL", "URL должен начинаться с http:// или https://")

    limits = httpx.Limits(max_connections=10, max_keepalive_connections=5)
    timeout = httpx.Timeout(timeout_seconds, connect=timeout_seconds)

    current = url
    redirects = 0
    async with httpx.AsyncClient(follow_redirects=False, timeout=timeout, limits=limits) as client:
        while True:
            try:
                async with client.stream(
                    "GET",
                    current,
                    headers={"User-Agent": "HH-MVP-Resume-Importer/1.0"},
                ) as resp:
                    status = resp.status_code
                    if status in (401, 403):
                        raise ResumeUrlNotPublic("RESUME_URL_NOT_PUBLIC", "Ссылка недоступна без авторизации (не публичная).")
                    if status in (301, 302, 303, 307, 308):
                        loc = resp.headers.get("location") or ""
                        if not loc:
                            raise ResumeFetchFailed("RESUME_FETCH_FAILED", "Редирект без location.")
                        if _looks_like_login_redirect(loc):
                            raise ResumeUrlNotPublic("RESUME_URL_NOT_PUBLIC", "Ссылка ведёт на страницу логина (не публичная).")
                        redirects += 1
                        if redirects > max_redirects:
                            raise ResumeFetchFailed("RESUME_FETCH_FAILED", "Слишком много редиректов.")
                        current = urljoin(current, loc)
                        continue
                    if status != 200:
                        raise ResumeFetchFailed("RESUME_FETCH_FAILED", f"Не удалось скачать резюме (HTTP {status}).")

                    ct = (resp.headers.get("content-type") or "").split(";")[0].strip().lower()
                    cl = resp.headers.get("content-length")
                    if cl and cl.isdigit() and int(cl) > max_bytes:
                        raise ResumeFetchFailed("RESUME_FETCH_FAILED", "Документ слишком большой по ссылке.")

                    body = bytearray()
                    async for chunk in resp.aiter_bytes():
                        body.extend(chunk)
                        if len(body) > max_bytes:
                            raise ResumeFetchFailed("RESUME_FETCH_FAILED", "Документ слишком большой по ссылке.")
                    return FetchedUrlContent(final_url=str(resp.url), content_type=ct, body=bytes(body))
            except ResumeImportError:
                raise
            except httpx.RequestError as e:
                raise ResumeFetchFailed("RESUME_FETCH_FAILED", f"Ошибка сети при скачивании: {e}")


def extract_text_from_bytes(*, data: bytes, file_name: str | None, content_type: str | None) -> tuple[str, list[str]]:
    """
    Returns (text, warnings).
    """
    ct = (content_type or "").lower()
    name = (file_name or "").lower()
    warnings: list[str] = []

    def ext() -> str:
        if "." in name:
            return name.rsplit(".", 1)[-1]
        return ""

    e = ext()

    if "text/html" in ct or e in ("html", "htm") or (ct == "" and e == ""):
        # Best-effort: if no content-type, try treating as HTML first.
        try:
            text = html_to_text(data.decode("utf-8", errors="ignore"))
        except Exception:
            text = html_to_text(data.decode("cp1251", errors="ignore"))
        if not _looks_like_resume_text(text):
            warnings.append("HTML_DOES_NOT_LOOK_LIKE_RESUME")
        return text, warnings

    if "application/pdf" in ct or e == "pdf":
        return extract_text_from_pdf(data), warnings
    if (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in ct
        or e == "docx"
        or "application/msword" in ct
    ):
        # Note: legacy .doc isn't supported in MVP.
        if e == "doc":
            raise UnsupportedFileType("UNSUPPORTED_FILE_TYPE", "Формат .doc не поддерживается. Используйте .docx/.pdf/.txt")
        return extract_text_from_docx(data), warnings
    if "text/plain" in ct or e == "txt":
        return extract_text_from_txt(data), warnings

    raise UnsupportedFileType("UNSUPPORTED_FILE_TYPE", "Неподдерживаемый тип файла. Разрешены: pdf, docx, txt")


def enforce_max_file_size(data: bytes, *, max_bytes: int = MAX_FILE_BYTES) -> None:
    if len(data) > max_bytes:
        raise ResumeImportError("FILE_TOO_LARGE", f"Файл слишком большой (>{max_bytes // (1024 * 1024)}MB).")


SourceType = Literal["url", "file"]

