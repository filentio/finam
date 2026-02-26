from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup


HH_BASE = "https://hh.ru"
DEFAULT_UA = "Mozilla/5.0 (compatible; HH-MVP/1.0; +https://example.invalid)"


class HHPublicSearchError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class HHPublicBlocked(HHPublicSearchError):
    pass


@dataclass(frozen=True)
class VacancyPublic:
    external_vacancy_id: str
    title: str
    company_name: str | None
    area_name: str | None
    salary_text: str | None
    published_at: datetime | None
    alternate_url: str
    snippet_requirement: str | None = None
    snippet_responsibility: str | None = None


@dataclass(frozen=True)
class VacancyDetail:
    published_at: datetime | None
    description_text: str | None


_VAC_ID_RE = re.compile(r"/vacancy/(\d+)")


def _detect_blocking(status_code: int, html: str) -> None:
    if status_code in (403, 429):
        raise HHPublicBlocked("HH_PUBLIC_BLOCKED", f"HH публичный источник заблокировал запрос (HTTP {status_code}).")
    s = (html or "").lower()
    if any(x in s for x in ("captcha", "робот", "robot", "g-recaptcha", "hcaptcha")):
        raise HHPublicBlocked("HH_PUBLIC_BLOCKED", "HH показал капчу/защиту от ботов.")


def _parse_relative_date(text: str, now: datetime) -> datetime | None:
    t = (text or "").strip().lower()
    if not t:
        return None
    if "сегодня" in t:
        return now
    if "вчера" in t:
        return now - timedelta(days=1)
    return None


_RU_MONTHS = {
    "января": 1,
    "февраля": 2,
    "марта": 3,
    "апреля": 4,
    "мая": 5,
    "июня": 6,
    "июля": 7,
    "августа": 8,
    "сентября": 9,
    "октября": 10,
    "ноября": 11,
    "декабря": 12,
}


def _parse_ru_date(text: str) -> datetime | None:
    # examples: "20 февраля 2026", "3 мар 2025" (best-effort)
    t = (text or "").strip().lower()
    m = re.search(r"\b(\d{1,2})\s+([а-я]+)\s+(\d{4})\b", t)
    if not m:
        return None
    day = int(m.group(1))
    month_name = m.group(2)
    year = int(m.group(3))
    month = _RU_MONTHS.get(month_name)
    if not month:
        return None
    return datetime(year, month, day, tzinfo=timezone.utc)


def parse_hh_search_results(html: str) -> list[VacancyPublic]:
    soup = BeautifulSoup(html or "", "html.parser")
    now = datetime.now(timezone.utc)

    out: list[VacancyPublic] = []
    # Primary selector used by HH: <a data-qa="vacancy-serp__vacancy-title" href="...">
    for a in soup.select('a[data-qa="vacancy-serp__vacancy-title"]'):
        href = a.get("href") or ""
        m = _VAC_ID_RE.search(href)
        if not m:
            continue
        vid = m.group(1)
        title = a.get_text(" ", strip=True) or ""
        if not title:
            continue

        # Walk up to vacancy item container to pick related fields.
        container = a
        for _ in range(6):
            if container is None:
                break
            if getattr(container, "attrs", None) and ("data-qa" in container.attrs) and container.attrs.get("data-qa") == "vacancy-serp__vacancy":
                break
            container = container.parent  # type: ignore[assignment]

        def pick(selector: str) -> str | None:
            node = container.select_one(selector) if container is not None else None
            if not node:
                return None
            txt = node.get_text(" ", strip=True)
            return txt or None

        company = pick('[data-qa="vacancy-serp__vacancy-employer"]')
        area = pick('[data-qa="vacancy-serp__vacancy-address"]')
        salary = pick('[data-qa="vacancy-serp__vacancy-compensation"]')
        date_txt = pick('[data-qa="vacancy-serp__vacancy-date"]')
        published_at = _parse_relative_date(date_txt or "", now=now)
        req = pick('[data-qa="vacancy-serp__vacancy_snippet_requirement"]')
        resp = pick('[data-qa="vacancy-serp__vacancy_snippet_responsibility"]')

        url = href if href.startswith("http") else urljoin(HH_BASE, href)
        out.append(
            VacancyPublic(
                external_vacancy_id=vid,
                title=title,
                company_name=company,
                area_name=area,
                salary_text=salary,
                published_at=published_at,
                alternate_url=url,
                snippet_requirement=req,
                snippet_responsibility=resp,
            )
        )
    return out


def parse_vacancy_detail(html: str) -> VacancyDetail:
    soup = BeautifulSoup(html or "", "html.parser")

    # Published at: try time[datetime], then text near data-qa creation time.
    published_at: datetime | None = None
    tnode = soup.find("time")
    if tnode and tnode.get("datetime"):
        dt = tnode.get("datetime")
        try:
            published_at = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except Exception:
            published_at = None

    if not published_at:
        meta = soup.select_one('[data-qa="vacancy-view-creation-time"]')
        if meta:
            txt = meta.get_text(" ", strip=True)
            published_at = _parse_ru_date(txt)

    desc_node = soup.select_one('[data-qa="vacancy-description"]')
    description = desc_node.get_text("\n", strip=True) if desc_node else None
    return VacancyDetail(published_at=published_at, description_text=description or None)


async def search_vacancies_html(
    *,
    template_json: dict[str, Any],
    page: int = 0,
    sort_mode: str = "relevance",
    date_filter_days: int | None = None,
    timeout_seconds: float = 10.0,
    rate_limit_seconds: float = 1.0,
) -> list[VacancyPublic]:
    query = (template_json.get("query") or "").strip()
    if not query:
        raise HHPublicSearchError("TEMPLATE_INVALID", "В шаблоне поиска отсутствует query.")

    excluded = template_json.get("exclude_keywords") or []
    if isinstance(excluded, list):
        excluded_text = " ".join([str(x) for x in excluded if isinstance(x, str) and x.strip()]) or None
    else:
        excluded_text = None

    params: dict[str, Any] = {"text": query, "page": page}
    if excluded_text:
        params["excluded_text"] = excluded_text
    if sort_mode == "date":
        params["order_by"] = "publication_time"
    # HH supports search_period (days) in UI; best-effort.
    if date_filter_days and 1 <= int(date_filter_days) <= 30:
        params["search_period"] = int(date_filter_days)

    headers = {"User-Agent": DEFAULT_UA, "Accept-Language": "ru,en;q=0.8"}
    timeout = httpx.Timeout(timeout_seconds, connect=timeout_seconds)
    async with httpx.AsyncClient(follow_redirects=True, timeout=timeout) as client:
        resp = await client.get(urljoin(HH_BASE, "/search/vacancy"), params=params, headers=headers)
        html = resp.text
        _detect_blocking(resp.status_code, html)
        items = parse_hh_search_results(html)
        # global pacing
        await asyncio.sleep(rate_limit_seconds)
        return items


async def fetch_vacancy_detail(
    *,
    url: str,
    timeout_seconds: float = 10.0,
    rate_limit_seconds: float = 1.0,
) -> VacancyDetail:
    headers = {"User-Agent": DEFAULT_UA, "Accept-Language": "ru,en;q=0.8"}
    timeout = httpx.Timeout(timeout_seconds, connect=timeout_seconds)
    async with httpx.AsyncClient(follow_redirects=True, timeout=timeout) as client:
        resp = await client.get(url, headers=headers)
        html = resp.text
        _detect_blocking(resp.status_code, html)
        detail = parse_vacancy_detail(html)
        await asyncio.sleep(rate_limit_seconds)
        return detail

