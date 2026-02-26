from __future__ import annotations

from typing import Any

from app.models.resume import Resume


def _as_list(v: Any) -> list:
    return v if isinstance(v, list) else []


def _as_str(v: Any) -> str:
    return v.strip() if isinstance(v, str) else ""


def _uniq(items: list[str], limit: int) -> list[str]:
    seen = set()
    out: list[str] = []
    for s in items:
        k = s.strip().lower()
        if not k or k in seen:
            continue
        seen.add(k)
        out.append(s.strip())
        if len(out) >= limit:
            break
    return out


def _highlights(desc: str, limit: int = 3) -> list[str]:
    if not desc:
        return []
    # Prefer line breaks/bullets, otherwise split by sentences.
    parts = [x.strip(" -\t") for x in desc.splitlines() if x and x.strip()]
    if len(parts) < 2:
        parts = [x.strip() for x in desc.replace("•", ". ").split(".") if x and x.strip()]
    return [p for p in parts if len(p) >= 5][:limit]


def build_resume_context(resume: Resume) -> dict[str, Any]:
    """
    Compact resume into a small JSON object suitable for LLM context.
    If parsed_json is missing, include a raw excerpt.
    """
    parsed = resume.parsed_json if isinstance(resume.parsed_json, dict) else None
    if not parsed:
        raw = (resume.raw_text or "").strip()
        return {"raw_excerpt": raw[:2000] if raw else ""}

    profession = _as_str(parsed.get("profession"))
    skills = [_as_str(x) for x in _as_list(parsed.get("skills"))]
    skills = _uniq([x for x in skills if x], 20)

    keywords = [_as_str(x) for x in _as_list(parsed.get("keywords"))]
    keywords = _uniq([x for x in keywords if x], 30)

    exp_out: list[dict[str, Any]] = []
    for item in _as_list(parsed.get("experience")):
        if not isinstance(item, dict):
            continue
        company = _as_str(item.get("company"))
        role = _as_str(item.get("role"))
        from_s = _as_str(item.get("from"))
        to_s = _as_str(item.get("to"))
        period = " — ".join([x for x in [from_s, to_s] if x]) or None
        desc = _as_str(item.get("description"))
        exp_out.append(
            {
                "company": company or None,
                "role": role or None,
                "period": period,
                "highlights": _highlights(desc, limit=3),
            }
        )
        if len(exp_out) >= 5:
            break

    return {
        "profession": profession or None,
        "skills": skills,
        "experience": exp_out,
        "keywords": keywords,
    }

