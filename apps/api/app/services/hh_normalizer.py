from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any


_TZ_NO_COLON_RE = re.compile(r"([+-]\d{2})(\d{2})$")


def parse_hh_datetime(value: str | None) -> datetime | None:
    if not value or not isinstance(value, str):
        return None
    s = value.strip()
    if not s:
        return None
    # HH often returns ISO strings like 2026-02-20T10:00:00+0300
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    m = _TZ_NO_COLON_RE.search(s)
    if m:
        s = s[: m.start()] + f"{m.group(1)}:{m.group(2)}"
    try:
        dt = datetime.fromisoformat(s)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


@dataclass(frozen=True)
class NormalizedVacancy:
    external_vacancy_id: str
    title: str
    hh_url: str | None
    employer_id: str | None
    employer_name: str | None
    area_name: str | None
    salary_from: int | None
    salary_to: int | None
    salary_currency: str | None
    experience: str | None
    employment: str | None
    schedule: str | None
    published_at: datetime | None
    apply_via_hh: bool
    external_apply_url: str | None
    raw_json: dict[str, Any]


def normalize_hh_vacancy(item: dict[str, Any]) -> NormalizedVacancy:
    external_id = str(item.get("id") or "")
    title = str(item.get("name") or item.get("title") or "").strip()
    hh_url = item.get("alternate_url") or item.get("hh_url")

    employer = item.get("employer") or {}
    employer_id = employer.get("id")
    employer_name = employer.get("name")

    area = item.get("area") or {}
    area_name = area.get("name")

    salary = item.get("salary") or {}
    salary_from = salary.get("from")
    salary_to = salary.get("to")
    salary_currency = salary.get("currency")

    experience = (item.get("experience") or {}).get("id") if isinstance(item.get("experience"), dict) else item.get("experience")
    employment = (item.get("employment") or {}).get("id") if isinstance(item.get("employment"), dict) else item.get("employment")
    schedule = (item.get("schedule") or {}).get("id") if isinstance(item.get("schedule"), dict) else item.get("schedule")

    published_at = parse_hh_datetime(item.get("published_at"))

    # In stage 5 we do not fully classify external apply; default to True.
    apply_via_hh = True
    external_apply_url = None

    return NormalizedVacancy(
        external_vacancy_id=external_id,
        title=title or external_id,
        hh_url=str(hh_url) if hh_url else None,
        employer_id=str(employer_id) if employer_id else None,
        employer_name=str(employer_name) if employer_name else None,
        area_name=str(area_name) if area_name else None,
        salary_from=int(salary_from) if salary_from is not None else None,
        salary_to=int(salary_to) if salary_to is not None else None,
        salary_currency=str(salary_currency) if salary_currency else None,
        experience=str(experience) if experience else None,
        employment=str(employment) if employment else None,
        schedule=str(schedule) if schedule else None,
        published_at=published_at,
        apply_via_hh=apply_via_hh,
        external_apply_url=external_apply_url,
        raw_json=item,
    )

