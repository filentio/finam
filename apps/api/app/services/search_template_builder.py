from __future__ import annotations

from typing import Any

from app.services.synonyms import expand_role, normalize_whitespace


DEFAULT_EXCLUDE = [
    "sales",
    "support",
    "call-center",
    "оператор",
    "продажи",
    "поддержка",
]


def _as_list(v: Any) -> list[str]:
    if isinstance(v, list):
        out = []
        for x in v:
            if isinstance(x, str) and x.strip():
                out.append(x.strip())
        return out
    return []


def _uniq(seq: list[str], limit: int) -> list[str]:
    seen = set()
    out: list[str] = []
    for s in seq:
        k = s.strip().lower()
        if not k or k in seen:
            continue
        seen.add(k)
        out.append(s.strip())
        if len(out) >= limit:
            break
    return out


def build_template_from_resume(parsed_resume_json: dict[str, Any]) -> dict[str, Any]:
    """
    MVP heuristic:
    - target_role: profession or first experience role
    - must_have: top skills (up to 15)
    - nice_to_have: keywords (up to 15), excluding must_have
    - query: role + a few must_have tokens (short)
    """
    r = parsed_resume_json or {}
    profession = r.get("profession") if isinstance(r.get("profession"), str) else None
    experience = r.get("experience") if isinstance(r.get("experience"), list) else []

    first_role = None
    for item in experience:
        if isinstance(item, dict) and isinstance(item.get("role"), str) and item.get("role").strip():
            first_role = item.get("role").strip()
            break

    target_role = normalize_whitespace(profession or first_role or "")
    role_terms = expand_role(target_role) if target_role else []

    skills = _as_list(r.get("skills"))
    keywords = _as_list(r.get("keywords"))

    must_have = _uniq(skills, 15)
    nice = [k for k in keywords if k.strip().lower() not in {x.lower() for x in must_have}]
    nice_to_have = _uniq(nice, 15)

    # Build query tokens: role terms + must-have (short)
    query_tokens: list[str] = []
    if role_terms:
        # Take up to 2 role variants (keep it short).
        query_tokens.extend(role_terms[:2])
    if not query_tokens and target_role:
        query_tokens.append(target_role)
    # Add a few must-have skills.
    query_tokens.extend(must_have[:8])

    query = normalize_whitespace(" ".join(_uniq(query_tokens, 12)))

    template = {
        "target_role": target_role or None,
        "query": query or None,
        "must_have": must_have,
        "nice_to_have": nice_to_have,
        "exclude_keywords": DEFAULT_EXCLUDE,
        "locations": [],
        "salary_min": None,
    }
    return template

