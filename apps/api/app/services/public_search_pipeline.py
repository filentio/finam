from __future__ import annotations

import logging
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.orm import Session, sessionmaker

from app.models.match import Match
from app.models.search_profile import SearchProfile
from app.models.vacancy import Vacancy
from app.services.hh_public_search import (
    HHPublicBlocked,
    HHPublicSearchError,
    VacancyPublic,
    fetch_vacancy_detail,
    search_vacancies_html,
)
from app.services.matcher import compute_match


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RunResult:
    run_id: uuid.UUID
    ingested: int
    matched: int


_SAL_RE = re.compile(r"(\d[\d \u00A0]{1,})")


def _parse_salary_text(s: str | None) -> tuple[int | None, int | None, str | None]:
    if not s:
        return None, None, None
    txt = s.replace("\u00A0", " ").strip()
    cur = "RUR" if "₽" in txt or "руб" in txt.lower() else None
    nums = [int(x.replace(" ", "")) for x in _SAL_RE.findall(txt) if x.strip().replace(" ", "").isdigit()]
    if not nums:
        return None, None, cur
    lo = None
    hi = None
    t = txt.lower()
    if "до" in t and len(nums) >= 1:
        hi = nums[0]
    elif "от" in t and len(nums) >= 1:
        lo = nums[0]
    elif "—" in txt or "-" in txt:
        if len(nums) >= 2:
            lo, hi = nums[0], nums[1]
        else:
            lo = nums[0]
    else:
        lo = nums[0]
    return lo, hi, cur


def _date_bonus(published_at: datetime | None, now: datetime) -> tuple[int, dict[str, str] | None]:
    if not published_at:
        return -3, {"type": "info", "code": "PUBLISHED_UNKNOWN", "text": "Дата публикации не распознана (понижен приоритет)."}
    age_days = (now - published_at).total_seconds() / 86400
    if age_days <= 1.0:
        return 6, {"type": "positive", "code": "FRESH", "text": "Свежая вакансия (≤1 дня)."}
    if age_days <= 3.0:
        return 4, {"type": "positive", "code": "FRESH", "text": "Свежая вакансия (≤3 дней)."}
    if age_days <= 7.0:
        return 2, {"type": "info", "code": "RECENT", "text": "Недавняя вакансия (≤7 дней)."}
    return 0, None


async def run_search_profile_public_ingestion(
    *,
    db: Session,
    user_id: uuid.UUID,
    search_profile_id: uuid.UUID,
    request_id: str | None = None,
    max_pages: int = 3,
    detail_top_k: int = 10,
) -> RunResult:
    sp = db.get(SearchProfile, search_profile_id)
    if sp is None or sp.user_id != user_id:
        raise ValueError("Search profile not found or not owned by user.")
    template = sp.template_json or {}
    if not isinstance(template, dict) or not template.get("query"):
        raise HHPublicSearchError("TEMPLATE_REQUIRED", "Нужно заполнить template_json (query) для public поиска.")

    now = datetime.now(timezone.utc)
    run_id = uuid.uuid4()
    ingested = 0
    matched = 0

    cutoff: datetime | None = None
    if sp.date_filter_days and sp.date_filter_days > 0:
        cutoff = now - timedelta(days=int(sp.date_filter_days))

    collected: list[VacancyPublic] = []
    try:
        for page in range(max_pages):
            items = await search_vacancies_html(
                template_json=template,
                page=page,
                sort_mode=sp.sort_mode or "relevance",
                date_filter_days=sp.date_filter_days,
            )
            if not items:
                break
            collected.extend(items)
    except HHPublicBlocked:
        raise

    # Upsert vacancies.
    vacancy_rows: list[Vacancy] = []
    for vp in collected:
        v = (
            db.query(Vacancy)
            .filter(Vacancy.source == "hh_public", Vacancy.external_vacancy_id == vp.external_vacancy_id)
            .one_or_none()
        )
        if v is None:
            v = Vacancy(source="hh_public", external_vacancy_id=vp.external_vacancy_id, title=vp.title)
            db.add(v)

        s_from, s_to, s_cur = _parse_salary_text(vp.salary_text)
        v.title = vp.title
        v.employer_name = vp.company_name
        v.area_name = vp.area_name
        v.salary_from = s_from
        v.salary_to = s_to
        v.salary_currency = s_cur
        v.published_at = vp.published_at
        v.apply_via_hh = False
        v.hh_url = vp.alternate_url
        v.external_apply_url = vp.alternate_url
        v.raw_json = {
            "source": "hh_public",
            "alternate_url": vp.alternate_url,
            "salary_text": vp.salary_text,
            "snippet": {"requirement": vp.snippet_requirement, "responsibility": vp.snippet_responsibility},
        }
        v.raw_fetched_at = now
        db.flush()
        ingested += 1
        vacancy_rows.append(v)

    # Fetch details for top K and update.
    for v in vacancy_rows[: max(0, int(detail_top_k))]:
        url = v.external_apply_url or v.hh_url
        if not url:
            continue
        try:
            d = await fetch_vacancy_detail(url=url)
        except HHPublicBlocked:
            raise
        except Exception:
            continue
        if d.published_at:
            v.published_at = d.published_at
        raw = v.raw_json or {}
        if isinstance(raw, dict):
            raw["description"] = d.description_text
        v.raw_json = raw
        v.raw_fetched_at = now
        db.add(v)
    db.flush()

    # Compute matches.
    for v in vacancy_rows:
        if cutoff and v.published_at and v.published_at < cutoff:
            continue
        match_payload = compute_match(sp, v)

        # Date bonus only for relevance mode.
        if (sp.sort_mode or "relevance") == "relevance":
            bonus, reason = _date_bonus(v.published_at, now)
            if bonus != 0:
                match_payload["score"] = max(0, min(100, int(match_payload["score"]) + bonus))
                if reason:
                    match_payload["reasons"] = (match_payload.get("reasons") or []) + [reason]

        m = (
            db.query(Match)
            .filter(Match.search_profile_id == search_profile_id, Match.vacancy_id == v.id)
            .one_or_none()
        )
        if m is None:
            m = Match(
                user_id=user_id,
                search_profile_id=search_profile_id,
                vacancy_id=v.id,
                score=match_payload["score"],
                reasons_json=match_payload["reasons"],
                missing_skills_json=match_payload["missing_skills"],
                is_blocked=match_payload["is_blocked"],
                blocked_reason=match_payload["blocked_reason"],
                computed_at=now,
            )
            db.add(m)
        else:
            m.score = match_payload["score"]
            m.reasons_json = match_payload["reasons"]
            m.missing_skills_json = match_payload["missing_skills"]
            m.is_blocked = match_payload["is_blocked"]
            m.blocked_reason = match_payload["blocked_reason"]
            m.computed_at = now
            db.add(m)
        matched += 1

    db.commit()
    logger.info(
        "Public search run completed",
        extra={"request_id": request_id, "run_id": str(run_id), "search_profile_id": str(search_profile_id), "ingested": ingested},
    )
    return RunResult(run_id=run_id, ingested=ingested, matched=matched)


async def run_search_profile_public_job(
    *,
    session_local: sessionmaker,
    user_id: uuid.UUID,
    search_profile_id: uuid.UUID,
    request_id: str | None = None,
) -> None:
    db = session_local()
    try:
        await run_search_profile_public_ingestion(
            db=db,
            user_id=user_id,
            search_profile_id=search_profile_id,
            request_id=request_id,
            max_pages=3,
            detail_top_k=10,
        )
    except Exception:
        logger.exception(
            "Public search profile job failed",
            extra={"request_id": request_id, "search_profile_id": str(search_profile_id), "user_id": str(user_id)},
        )
        db.rollback()
    finally:
        db.close()

