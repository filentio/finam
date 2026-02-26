from __future__ import annotations

import re
from collections import Counter

from app.services.resume_normalizer import extract_numbers_allowlist


_HEADERS = [
    "навыки",
    "skills",
    "tech stack",
    "стек",
    "опыт работы",
    "experience",
    "образование",
    "education",
    "проекты",
    "projects",
    "сертификаты",
    "certifications",
]


_STOPWORDS_RU = {
    "и",
    "в",
    "во",
    "на",
    "по",
    "с",
    "со",
    "к",
    "ко",
    "от",
    "до",
    "из",
    "у",
    "за",
    "про",
    "для",
    "или",
    "а",
    "но",
    "что",
    "это",
    "как",
    "я",
    "мы",
    "вы",
    "он",
    "она",
    "они",
    "его",
    "ее",
    "их",
    "мой",
    "моя",
    "мои",
    "наши",
    "ваши",
    "опыт",
    "работа",
    "лет",
    "год",
    "года",
    "месяц",
    "месяцев",
    "компания",
    "проект",
    "проекты",
    "достижения",
    "обязанности",
}

_STOPWORDS_EN = {
    "and",
    "or",
    "the",
    "a",
    "an",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "from",
    "at",
    "by",
    "as",
    "is",
    "are",
    "was",
    "were",
    "this",
    "that",
    "it",
    "i",
    "we",
    "you",
    "he",
    "she",
    "they",
    "experience",
    "skills",
    "project",
    "projects",
    "responsibilities",
}


_DATE_RANGE_PAT = re.compile(
    r"(?P<from>(?:\b(19|20)\d{2}\b|(?:\b\d{2}[./](19|20)\d{2}\b)|(?:\b[a-zа-я]{3,10}\s+(19|20)\d{2}\b)))"
    r"\s*[-—–]\s*"
    r"(?P<to>(?:\b(19|20)\d{2}\b|\b[a-zа-я]{3,10}\s+(19|20)\d{2}\b|present|current|настоящее\s+время|настоящее))",
    re.IGNORECASE,
)


def _lines(text: str) -> list[str]:
    return [x.strip() for x in (text or "").splitlines() if x and x.strip()]


def _is_heading(line: str) -> bool:
    l = (line or "").strip().lower()
    if not l:
        return False
    if len(l) <= 2:
        return False
    if any(h in l for h in _HEADERS):
        return True
    # All-caps short lines are often headings.
    letters = re.sub(r"[^a-zа-я]", "", l, flags=re.IGNORECASE)
    if letters and letters == letters.upper() and len(letters) < 25:
        return True
    return False


def _extract_profession(text: str) -> str | None:
    lines = _lines(text)
    if not lines:
        return None

    patterns = [
        re.compile(r"^\s*(желаемая\s+должность|позиция|role|profession)\s*[:\-—]\s*(.+)$", re.IGNORECASE),
        re.compile(r"^\s*(должность|позиция)\s*[:\-—]\s*(.+)$", re.IGNORECASE),
    ]
    for line in lines[:40]:
        for pat in patterns:
            m = pat.match(line)
            if m:
                val = (m.group(2) or "").strip()
                if val and len(val) <= 120:
                    return val

    # Fallback: first non-heading reasonable line.
    for line in lines[:20]:
        if _is_heading(line):
            continue
        if 2 <= len(line) <= 80 and not _DATE_RANGE_PAT.search(line):
            return line
    return None


def _section_after_heading(text: str, heading_keywords: tuple[str, ...], max_lines: int = 30) -> list[str]:
    lines = _lines(text)
    for i, line in enumerate(lines[:300]):
        l = line.lower()
        if any(k in l for k in heading_keywords):
            out: list[str] = []
            for j in range(i + 1, min(i + 1 + max_lines, len(lines))):
                if _is_heading(lines[j]):
                    break
                out.append(lines[j])
            return out
    return []


def _split_skills(lines: list[str]) -> list[str]:
    raw = " \n ".join(lines)
    parts = re.split(r"[,;/•·\u2022\n]+", raw)
    cleaned: list[str] = []
    for p in parts:
        s = re.sub(r"\s+", " ", p).strip(" -\t")
        if not s:
            continue
        if len(s) > 60:
            continue
        cleaned.append(s)
    # De-dup preserve order (case-insensitive)
    seen = set()
    out: list[str] = []
    for s in cleaned:
        k = s.lower()
        if k in seen:
            continue
        seen.add(k)
        out.append(s)
    return out[:80]


def _extract_skills(text: str) -> list[str]:
    sec = _section_after_heading(text, ("навык", "skills", "tech stack", "стек"))
    skills = _split_skills(sec) if sec else []

    # Augment with common tokens if section missing.
    if len(skills) < 5:
        commons = [
            "python",
            "sql",
            "postgres",
            "fastapi",
            "django",
            "pandas",
            "numpy",
            "product",
            "analytics",
            "ml",
            "docker",
            "kubernetes",
            "aws",
            "gcp",
            "etl",
            "airflow",
        ]
        t = (text or "").lower()
        for c in commons:
            if c in t and c not in {x.lower() for x in skills}:
                skills.append(c)
    return skills[:80]


def _extract_experience(text: str) -> list[dict]:
    s = text or ""
    matches = list(_DATE_RANGE_PAT.finditer(s))
    if not matches:
        return []

    # Build blocks between date ranges.
    blocks: list[tuple[str, str, str]] = []
    for idx, m in enumerate(matches):
        start = m.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(s)
        block = s[start:end].strip()
        from_s = (m.group("from") or "").strip()
        to_s = (m.group("to") or "").strip()
        blocks.append((from_s, to_s, block))

    out: list[dict] = []
    for from_s, to_s, block in blocks[:50]:
        lines = _lines(block)
        # Heuristic: after the date range line, next line is company, next is role.
        company = None
        role = None
        description_lines: list[str] = []
        if lines:
            # Find the line that contains the date range; take subsequent.
            date_line_idx = 0
            for i, ln in enumerate(lines[:5]):
                if _DATE_RANGE_PAT.search(ln):
                    date_line_idx = i
                    break
            tail = lines[date_line_idx + 1 :]
            if tail:
                company = tail[0] if len(tail[0]) <= 120 else tail[0][:120]
            if len(tail) > 1:
                role = tail[1] if len(tail[1]) <= 120 else tail[1][:120]
            if len(tail) > 2:
                description_lines = tail[2:20]

        desc = "\n".join(description_lines).strip() if description_lines else None
        out.append(
            {
                "company": company,
                "role": role,
                "from": from_s or None,
                "to": to_s or None,
                "description": desc,
            }
        )
    return out


def _tokenize(text: str) -> list[str]:
    t = (text or "").lower()
    t = re.sub(r"[^a-zа-я0-9+#._\- ]", " ", t, flags=re.IGNORECASE)
    t = re.sub(r"\s+", " ", t).strip()
    return [x for x in t.split(" ") if x]


def _extract_keywords(text: str, *, profession: str | None, skills: list[str]) -> list[str]:
    tokens = _tokenize(text)
    stop = _STOPWORDS_RU | _STOPWORDS_EN
    filtered = [t for t in tokens if len(t) >= 3 and t not in stop and not t.isdigit()]
    freq = Counter(filtered)
    common = [w for w, _ in freq.most_common(30)]

    seed: list[str] = []
    if profession:
        seed.extend([t for t in _tokenize(profession) if t not in stop])
    seed.extend([s.lower() for s in skills if s])

    # De-dup preserve order.
    out: list[str] = []
    seen = set()
    for x in seed + common:
        k = x.strip().lower()
        if not k or k in seen:
            continue
        seen.add(k)
        out.append(k)
    return out[:40]


def parse_resume(text: str) -> dict:
    profession = _extract_profession(text)
    skills = _extract_skills(text)
    experience = _extract_experience(text)
    keywords = _extract_keywords(text, profession=profession, skills=skills)
    return {
        "profession": profession,
        "skills": skills,
        "experience": experience,
        "keywords": keywords,
    }


def parse_stats(text: str) -> dict:
    s = (text or "").strip()
    words = [w for w in re.split(r"\s+", s) if w]
    return {"chars": len(s), "words": len(words)}


def numbers_allowlist(text: str) -> list[str]:
    return extract_numbers_allowlist(text or "", raw_json=None)

