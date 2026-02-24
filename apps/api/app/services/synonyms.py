from __future__ import annotations

import re


# Minimal, MVP-level normalization for common role synonyms.
ROLE_SYNONYMS: dict[str, list[str]] = {
    "product manager": ["pm", "product owner", "prod manager"],
    "head of product": ["product lead", "lead product", "head product", "руководитель продукта"],
    "cpo": ["chief product officer"],
    "data analyst": ["аналитик данных", "аналитик", "product analyst"],
    "backend developer": ["backend engineer", "software engineer", "python developer", "разработчик"],
}


def normalize_whitespace(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def expand_role(role: str) -> list[str]:
    r = normalize_whitespace(role).lower()
    if not r:
        return []
    out = [r]
    for k, syns in ROLE_SYNONYMS.items():
        if r == k or r in syns:
            out.append(k)
            out.extend(syns)
    # De-dup preserve order
    seen = set()
    final: list[str] = []
    for x in out:
        xx = normalize_whitespace(x).lower()
        if not xx or xx in seen:
            continue
        seen.add(xx)
        final.append(x)
    return final

