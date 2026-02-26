from __future__ import annotations

from app.services.search_template_builder import build_template_from_resume


def test_build_template_from_resume_basic() -> None:
    parsed = {
        "profession": "Head of Product",
        "skills": ["Product strategy", "Analytics", "SQL", "A/B testing", "Leadership"],
        "experience": [{"company": "X", "role": "Product Lead", "from": "2021", "to": "2023", "description": ""}],
        "keywords": ["fintech", "b2b", "ml", "python"],
    }
    tpl = build_template_from_resume(parsed)
    assert tpl.get("query")
    assert isinstance(tpl.get("must_have"), list) and len(tpl["must_have"]) >= 3
    assert tpl.get("target_role")

