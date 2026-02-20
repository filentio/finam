from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from app.models.search_profile import SearchProfile
from app.models.vacancy import Vacancy


STOPWORDS = {
    "и",
    "в",
    "во",
    "на",
    "с",
    "со",
    "по",
    "для",
    "the",
    "and",
    "or",
    "a",
    "an",
    "to",
    "of",
}


def _tokenize(text: str) -> list[str]:
    parts = re.findall(r"[A-Za-zА-Яа-я0-9+#.]{2,}", text.lower())
    return [p for p in parts if p not in STOPWORDS]


def _vacancy_search_text(vacancy: Vacancy) -> str:
    raw = vacancy.raw_json or {}
    snippet = raw.get("snippet") if isinstance(raw, dict) else None
    snippet_req = ""
    snippet_resp = ""
    if isinstance(snippet, dict):
        snippet_req = str(snippet.get("requirement") or "")
        snippet_resp = str(snippet.get("responsibility") or "")
    parts = [
        vacancy.title or "",
        vacancy.employer_name or "",
        vacancy.area_name or "",
        snippet_req,
        snippet_resp,
    ]
    return " ".join([p for p in parts if p])


@dataclass(frozen=True)
class MatchReason:
    type: str  # positive|negative|info
    code: str
    text: str


def compute_match(search_profile: SearchProfile, vacancy: Vacancy) -> dict[str, Any]:
    """
    Rule-based matcher for MVP.
    Returns:
      score: 0..100
      reasons: list[{type, code, text}]
      missing_skills: list[str] | None
      is_blocked: bool
      blocked_reason: str | None
    """
    filters = search_profile.filters_json or {}
    stoplist = search_profile.stoplist_json or {}

    reasons: list[dict[str, str]] = []

    text_blob = _vacancy_search_text(vacancy).lower()

    # Block rules: stoplisted employer
    stop_companies = stoplist.get("companies") or []
    stop_company_set = {str(x) for x in stop_companies}
    if vacancy.employer_id and str(vacancy.employer_id) in stop_company_set:
        reasons.append(
            {"type": "negative", "code": "STOPLIST_COMPANY", "text": "Работодатель в стоп-листе профиля поиска."}
        )
        return {
            "score": 0,
            "reasons": reasons,
            "missing_skills": None,
            "is_blocked": True,
            "blocked_reason": "STOPLIST_COMPANY",
        }

    # Block rules: stoplisted keywords
    stop_keywords = stoplist.get("keywords") or []
    for kw in stop_keywords:
        if not isinstance(kw, str):
            continue
        k = kw.strip().lower()
        if not k:
            continue
        if k in text_blob:
            reasons.append(
                {"type": "negative", "code": "STOPLIST_KEYWORD", "text": f"Найдено стоп-слово: «{kw}»."}
            )
            return {
                "score": 0,
                "reasons": reasons,
                "missing_skills": None,
                "is_blocked": True,
                "blocked_reason": "STOPLIST_KEYWORD",
            }

    score = 50

    # Salary rule
    salary_min = filters.get("salary_min")
    if salary_min is None:
        salary_min = filters.get("salary") or filters.get("salary_from")
    if isinstance(salary_min, str) and salary_min.strip().isdigit():
        salary_min = int(salary_min.strip())
    if isinstance(salary_min, int) and salary_min > 0:
        s_from = vacancy.salary_from
        s_to = vacancy.salary_to
        if s_from is None and s_to is None:
            score -= 5
            reasons.append({"type": "info", "code": "SALARY_UNKNOWN", "text": "Зарплата в вакансии не указана."})
        else:
            upper = s_to if s_to is not None else s_from
            lower = s_from if s_from is not None else s_to
            if upper is not None and upper < salary_min:
                score -= 30
                reasons.append(
                    {"type": "negative", "code": "SALARY_LOW", "text": "Вилка зарплаты ниже ожиданий профиля поиска."}
                )
            elif lower is not None and lower >= salary_min:
                score += 15
                reasons.append({"type": "positive", "code": "SALARY_OK", "text": "Зарплата соответствует ожиданиям."})
            else:
                score += 5
                reasons.append({"type": "info", "code": "SALARY_PARTIAL", "text": "Зарплата частично совпадает с ожиданиями."})

    # Experience rule
    exp_pref = filters.get("experience")
    if isinstance(exp_pref, str) and exp_pref.strip():
        if vacancy.experience and vacancy.experience == exp_pref:
            score += 10
            reasons.append({"type": "positive", "code": "EXPERIENCE_MATCH", "text": "Опыт соответствует профилю поиска."})
        elif vacancy.experience:
            score -= 10
            reasons.append({"type": "negative", "code": "EXPERIENCE_MISMATCH", "text": "Опыт не совпадает с профилем поиска."})

    # Area/location rule (best-effort; if area is numeric id, we skip string match)
    area_pref = filters.get("area_name") or filters.get("area")
    if isinstance(area_pref, str) and area_pref.strip() and not area_pref.strip().isdigit():
        if vacancy.area_name and vacancy.area_name.lower() == area_pref.strip().lower():
            score += 5
            reasons.append({"type": "positive", "code": "AREA_MATCH", "text": "Локация соответствует профилю поиска."})
        elif vacancy.area_name:
            score -= 10
            reasons.append({"type": "negative", "code": "AREA_MISMATCH", "text": "Локация отличается от профиля поиска."})

    # Keywords/skills rule
    kw_list = filters.get("keywords")
    keywords: list[str] = []
    if isinstance(kw_list, list):
        keywords = [str(x).strip() for x in kw_list if str(x).strip()]
    if not keywords:
        query = filters.get("text") or filters.get("query") or ""
        if isinstance(query, str) and query.strip():
            keywords = _tokenize(query)

    keywords = list(dict.fromkeys([k.lower() for k in keywords if len(k) >= 2]))  # unique, normalized

    matched: list[str] = []
    missing: list[str] = []
    if keywords:
        for k in keywords:
            if k in text_blob:
                matched.append(k)
            else:
                missing.append(k)

        if matched:
            boost = min(30, len(matched) * 10)
            score += boost
            reasons.append(
                {
                    "type": "positive",
                    "code": "KEYWORDS_MATCH",
                    "text": f"Совпали ключевые слова: {', '.join(matched[:5])}.",
                }
            )
        if missing:
            penalty = min(20, len(missing) * 5)
            score -= penalty
            reasons.append(
                {
                    "type": "info",
                    "code": "KEYWORDS_MISSING",
                    "text": f"Не найдены ключевые слова: {', '.join(missing[:5])}.",
                }
            )

    score = max(0, min(100, score))

    return {
        "score": score,
        "reasons": reasons,
        "missing_skills": missing[:10] if missing else None,
        "is_blocked": False,
        "blocked_reason": None,
    }

