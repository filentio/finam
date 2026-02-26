from __future__ import annotations

import asyncio
import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session, sessionmaker

from app.models.hh_account import HHAccount
from app.models.match import Match
from app.models.search_profile import SearchProfile
from app.models.vacancy import Vacancy
from app.services.hh_api_client import HHApiClient
from app.services.hh_normalizer import normalize_hh_vacancy
from app.services.matcher import compute_match

logger = logging.getLogger(__name__)


def build_hh_search_params(filters_json: dict[str, Any]) -> dict[str, Any]:
    """
    Minimal mapping from search_profiles.filters_json to HH /vacancies params.
    Supports common keys: text, area/area_id, experience, employment, schedule, salary.
    """
    params: dict[str, Any] = {}

    text = filters_json.get("text") or filters_json.get("query")
    if isinstance(text, str) and text.strip():
        params["text"] = text.strip()

    area = filters_json.get("area_id") or filters_json.get("area")
    # HH expects numeric area id; we pass-through if it looks like id.
    if isinstance(area, int):
        params["area"] = area
    elif isinstance(area, str) and area.strip().isdigit():
        params["area"] = area.strip()

    experience = filters_json.get("experience")
    if isinstance(experience, str) and experience.strip():
        params["experience"] = experience.strip()

    employment = filters_json.get("employment")
    if isinstance(employment, str) and employment.strip():
        params["employment"] = employment.strip()

    schedule = filters_json.get("schedule")
    if isinstance(schedule, str) and schedule.strip():
        params["schedule"] = schedule.strip()

    salary = filters_json.get("salary") or filters_json.get("salary_from")
    if isinstance(salary, int):
        params["salary"] = salary
    elif isinstance(salary, str) and salary.strip().isdigit():
        params["salary"] = int(salary.strip())

    # Pagination defaults
    per_page = filters_json.get("per_page")
    if isinstance(per_page, int):
        params["per_page"] = max(1, min(per_page, 100))
    else:
        params["per_page"] = 20
    params["page"] = 0

    return params


@dataclass(frozen=True)
class RunResult:
    run_id: uuid.UUID
    ingested: int
    matched: int


async def run_search_profile_ingestion(
    *,
    db: Session,
    user_id: uuid.UUID,
    search_profile_id: uuid.UUID,
    request_id: str | None = None,
    max_pages: int = 1,
) -> RunResult:
    sp = db.get(SearchProfile, search_profile_id)
    if sp is None or sp.user_id != user_id:
        raise ValueError("Search profile not found or not owned by user.")

    acc = db.query(HHAccount).filter(HHAccount.user_id == user_id).one_or_none()
    access_token = acc.access_token_ciphertext if (acc and acc.status == "active" and acc.access_token_ciphertext) else None

    params = build_hh_search_params(sp.filters_json or {})
    client = HHApiClient()
    now = datetime.now(timezone.utc)
    run_id = uuid.uuid4()

    ingested = 0
    matched = 0

    for page in range(max_pages):
        params["page"] = page
        payload = await client.search_vacancies(params=params, access_token=access_token, request_id=request_id)
        items = payload.get("items") or []
        if not isinstance(items, list) or not items:
            break

        for item in items:
            if not isinstance(item, dict):
                continue
            n = normalize_hh_vacancy(item)
            if not n.external_vacancy_id:
                continue

            v = (
                db.query(Vacancy)
                .filter(Vacancy.source == "hh", Vacancy.external_vacancy_id == n.external_vacancy_id)
                .one_or_none()
            )
            if v is None:
                v = Vacancy(source="hh", external_vacancy_id=n.external_vacancy_id, title=n.title)
                db.add(v)

            v.hh_url = n.hh_url
            v.title = n.title
            v.employer_id = n.employer_id
            v.employer_name = n.employer_name
            v.area_name = n.area_name
            v.salary_from = n.salary_from
            v.salary_to = n.salary_to
            v.salary_currency = n.salary_currency
            v.experience = n.experience
            v.employment = n.employment
            v.schedule = n.schedule
            v.published_at = n.published_at
            v.apply_via_hh = n.apply_via_hh
            v.external_apply_url = n.external_apply_url
            v.raw_json = n.raw_json
            v.raw_fetched_at = now

            db.flush()  # ensure v.id exists
            ingested += 1

            m = (
                db.query(Match)
                .filter(Match.search_profile_id == search_profile_id, Match.vacancy_id == v.id)
                .one_or_none()
            )
            match_payload = compute_match(sp, v)
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
                m.computed_at = now
                m.score = match_payload["score"]
                m.reasons_json = match_payload["reasons"]
                m.missing_skills_json = match_payload["missing_skills"]
                m.is_blocked = match_payload["is_blocked"]
                m.blocked_reason = match_payload["blocked_reason"]
                db.add(m)
            matched += 1

        # Stop if HH reports no more pages (best-effort)
        pages = payload.get("pages")
        if isinstance(pages, int) and (page + 1) >= pages:
            break

        # minimal pacing even without 429
        await asyncio.sleep(0.1)

    db.commit()
    logger.info(
        "Search profile ingestion completed",
        extra={"request_id": request_id, "run_id": str(run_id), "search_profile_id": str(search_profile_id), "ingested": ingested},
    )
    return RunResult(run_id=run_id, ingested=ingested, matched=matched)


async def run_search_profile_job(
    *,
    session_local: sessionmaker,
    user_id: uuid.UUID,
    search_profile_id: uuid.UUID,
    request_id: str | None = None,
) -> None:
    db = session_local()
    try:
        await run_search_profile_ingestion(
            db=db, user_id=user_id, search_profile_id=search_profile_id, request_id=request_id, max_pages=1
        )
    except Exception:
        logger.exception(
            "Search profile job failed",
            extra={"request_id": request_id, "search_profile_id": str(search_profile_id), "user_id": str(user_id)},
        )
        db.rollback()
    finally:
        db.close()

