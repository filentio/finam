from __future__ import annotations

import re
from typing import Any


def _as_str(v: Any) -> str:
    if v is None:
        return ""
    if isinstance(v, str):
        return v.strip()
    return str(v).strip()


def _join_lines(lines: list[str]) -> str:
    clean = [x.strip() for x in lines if x and x.strip()]
    # Collapse excessive whitespace
    return "\n".join(clean).strip()


def normalize_resume_to_text(raw_resume_json: dict[str, Any]) -> str:
    """
    Build a single text blob from HH resume JSON to use in matching and prompt context.
    Best-effort: HH resume schema can evolve; we avoid strict typing here.
    """
    r = raw_resume_json or {}

    title = _as_str(r.get("title") or r.get("name") or r.get("position"))
    summary = _as_str(r.get("summary") or r.get("skills") or r.get("about"))

    skill_set = r.get("skill_set") or r.get("skills") or r.get("key_skills") or []
    skills_line = ""
    if isinstance(skill_set, list):
        skills = [_as_str(x.get("name") if isinstance(x, dict) else x) for x in skill_set]
        skills = [x for x in skills if x]
        if skills:
            skills_line = "Skills: " + ", ".join(skills)

    lines: list[str] = []
    if title:
        lines.append(f"Резюме: {title}")
    if summary:
        lines.append("О себе:")
        lines.append(summary)
    if skills_line:
        lines.append(skills_line)

    # Experience
    exp = r.get("experience") or r.get("experiences") or []
    if isinstance(exp, list) and exp:
        lines.append("Опыт работы:")
        for item in exp:
            if not isinstance(item, dict):
                continue
            company = _as_str(item.get("company") or item.get("company_name"))
            position = _as_str(item.get("position"))
            start = _as_str(item.get("start") or item.get("start_date"))
            end = _as_str(item.get("end") or item.get("end_date"))
            desc = _as_str(item.get("description") or item.get("responsibilities") or item.get("achievements"))
            header_parts = [p for p in [position, company] if p]
            header = " — ".join(header_parts)
            dates = " ".join([p for p in [start, end] if p])
            if header:
                lines.append(f"- {header}{(' (' + dates + ')') if dates else ''}")
            if desc:
                lines.append(desc)

    # Education
    edu = r.get("education") or {}
    if isinstance(edu, dict):
        primary = edu.get("primary") or []
        if isinstance(primary, list) and primary:
            lines.append("Образование:")
            for e in primary:
                if not isinstance(e, dict):
                    continue
                name = _as_str(e.get("name"))
                org = _as_str(e.get("organization") or e.get("university"))
                result = _as_str(e.get("result") or e.get("faculty") or e.get("specialty"))
                parts = [x for x in [org or name, result] if x]
                if parts:
                    lines.append("- " + " — ".join(parts))

    # Languages
    langs = r.get("language") or r.get("languages") or []
    if isinstance(langs, list) and langs:
        items: list[str] = []
        for l in langs:
            if not isinstance(l, dict):
                continue
            name = _as_str((l.get("name") or (l.get("id") if isinstance(l.get("id"), str) else "")))
            level = _as_str((l.get("level") or {}).get("name") if isinstance(l.get("level"), dict) else l.get("level"))
            if name and level:
                items.append(f"{name} ({level})")
            elif name:
                items.append(name)
        if items:
            lines.append("Языки: " + ", ".join(items))

    return _join_lines(lines)


_NUM_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"\b(19|20)\d{2}\b"),  # years
    re.compile(r"(?<!\w)\d+(?:[.,]\d+)?\s*%(?!\w)"),  # percents (handles trailing punctuation)
    re.compile(r"\b\d+\s*(?:год|года|лет|years?)\b", re.IGNORECASE),
    re.compile(r"\b\d{1,3}(?:[ \u00A0]\d{3})+(?:[.,]\d+)?\b"),  # 1 000 000
    re.compile(r"\b\d+(?:[.,]\d+)?\s*(?:тыс|млн|млрд|k|m)\b", re.IGNORECASE),
]


def extract_numbers_allowlist(text: str, raw_json: dict[str, Any] | None = None) -> list[str]:
    """
    Extract a best-effort allowlist of numeric facts to permit in cover letters.
    We rely on text, and optionally raw_json in later stages.
    """
    _ = raw_json
    s = text or ""
    found: list[tuple[int, str]] = []
    for pat in _NUM_PATTERNS:
        for m in pat.finditer(s):
            val = m.group(0).strip()
            if val:
                found.append((m.start(), val))
    found.sort(key=lambda x: x[0])
    out: list[str] = []
    seen = set()
    for _, val in found:
        norm = val.replace("\u00A0", " ").strip()
        if norm.lower() in seen:
            continue
        seen.add(norm.lower())
        out.append(norm)
    return out[:200]

