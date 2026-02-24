from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from app.settings import Settings


NUMBER_PATTERNS = [
    r"\b\d{1,3}(?:[ \u00A0]\d{3})+(?:[.,]\d+)?\b",  # 200 000 / 1 200 000.50
    r"\b\d+(?:[.,]\d+)?\s*%?\b",  # 10 / 10% / 3.5
]

UNIT_SUFFIX = r"(?:\s*(?:лет|года|год|месяц(?:ев)?|мес\.?|k|к|тыс\.?|млн|руб\.?|₽|usd|eur))?"
NUMBER_RE = re.compile(rf"({'|'.join(NUMBER_PATTERNS)}){UNIT_SUFFIX}", re.IGNORECASE)


def normalize_number_phrase(s: str) -> str:
    x = s.strip().lower()
    x = x.replace("\u00A0", " ")
    x = re.sub(r"\s+", " ", x)
    x = x.replace("руб.", "руб").replace("мес.", "мес").replace("тыс.", "тыс")
    x = x.replace("₽", "руб")
    return x


@dataclass(frozen=True)
class ValidationIssue:
    error_code: str
    message: str


@dataclass(frozen=True)
class CoverLetterValidationResult:
    is_valid: bool
    errors: list[ValidationIssue]
    warnings: list[ValidationIssue]

    def to_json(self) -> dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "errors": [{"error_code": e.error_code, "message": e.message} for e in self.errors],
            "warnings": [{"error_code": w.error_code, "message": w.message} for w in self.warnings],
        }


def validate_cover_letter(
    *,
    letter_text: str,
    numbers_used: list[str] | None,
    allowlist_numbers: list[str] | None,
    settings: Settings,
) -> CoverLetterValidationResult:
    errors: list[ValidationIssue] = []
    warnings: list[ValidationIssue] = []

    text = (letter_text or "").strip()
    if len(text) < settings.COVER_LETTER_MIN_CHARS or len(text) > settings.COVER_LETTER_MAX_CHARS:
        errors.append(
            ValidationIssue(
                "LENGTH_OUT_OF_RANGE",
                f"Длина письма должна быть в диапазоне {settings.COVER_LETTER_MIN_CHARS}-{settings.COVER_LETTER_MAX_CHARS} символов.",
            )
        )

    forbidden = settings.COVER_LETTER_FORBIDDEN_PHRASES or []
    lowered = text.lower()
    for phrase in forbidden:
        if not isinstance(phrase, str):
            continue
        p = phrase.strip().lower()
        if p and p in lowered:
            errors.append(ValidationIssue("FORBIDDEN_PHRASE", f"Запрещённая фраза: «{phrase}»."))
            break

    allowlist_provided = allowlist_numbers is not None
    allow = {normalize_number_phrase(x) for x in (allowlist_numbers or []) if isinstance(x, str) and x.strip()}

    extracted = [normalize_number_phrase(m.group(0)) for m in NUMBER_RE.finditer(text)]
    for num in extracted:
        if allowlist_provided and num not in allow:
            errors.append(ValidationIssue("UNVERIFIED_NUMBER", f"Число/величина не в allowlist: «{num}»."))
            break

    for num in numbers_used or []:
        if not isinstance(num, str):
            continue
        n = normalize_number_phrase(num)
        if allowlist_provided and n not in allow:
            errors.append(ValidationIssue("UNVERIFIED_NUMBER", f"Число из numbers_used не в allowlist: «{num}»."))
            break

    return CoverLetterValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

