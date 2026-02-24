from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.cover_letter import CoverLetter
from app.models.candidate_profile import CandidateProfile
from app.models.cover_template import CoverTemplate
from app.models.match import Match
from app.models.search_profile import SearchProfile
from app.models.vacancy import Vacancy
from app.models.hh_resume import HHResume
from app.schemas.cover_letters import CoverLetterGenerateOut, CoverLetterOut
from app.schemas.vacancies import (
    CoverLetterGenerateIn,
    MatchCreateIn,
    MatchOut,
    VacancyDetailOut,
    VacancyListOut,
    VacancyListItem,
)
from app.services.matcher import compute_match
from app.services.cover_letter_gpt_generator import CoverLetterGptGenerator
from app.services.cover_letter_validator import validate_cover_letter
from app.services.openai_client import OpenAIResponsesClient, OpenAIRequestFailed, OpenAIUnavailable
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/vacancies", tags=["vacancies"])


@router.get("", response_model=VacancyListOut)
def list_vacancies(
    search_profile_id: uuid.UUID | None = None,
    limit: int = 50,
    cursor: str | None = None,
    sort: str = Query(default="score", pattern="^(score|date)$"),
    days: int | None = Query(default=None, ge=1, le=365),
    include_reasons: bool = False,
    db: Session = Depends(get_db),
) -> VacancyListOut:
    _ = cursor  # reserved for future cursor pagination
    user = get_or_create_stub_user(db)

    q = db.query(Vacancy)
    if limit <= 0 or limit > 200:
        raise HTTPException(status_code=400, detail="Некорректный limit.")

    items: list[VacancyListItem] = []

    if search_profile_id is None:
        if days:
            cutoff = datetime.now(timezone.utc) - timedelta(days=int(days))
            q = q.filter((Vacancy.published_at.is_(None)) | (Vacancy.published_at >= cutoff))
        vacancies = q.order_by(Vacancy.published_at.desc().nullslast(), Vacancy.created_at.desc()).limit(limit).all()
        for v in vacancies:
            items.append(
                VacancyListItem(
                    id=v.id,
                    source=v.source,
                    external_vacancy_id=v.external_vacancy_id,
                    title=v.title,
                    employer_name=v.employer_name,
                    area_name=v.area_name,
                    salary_from=v.salary_from,
                    salary_to=v.salary_to,
                    published_at=v.published_at,
                    apply_via_hh=v.apply_via_hh,
                    external_apply_url=v.external_apply_url,
                    score=None,
                    is_blocked=False,
                    blocked_reason=None,
                    reasons=[],
                )
            )
        return VacancyListOut(items=items, next_cursor=None)

    sp = db.get(SearchProfile, search_profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")

    # Join matches for the given profile.
    q2 = (
        db.query(Vacancy, Match)
        .join(Match, Match.vacancy_id == Vacancy.id)
        .filter(Match.search_profile_id == search_profile_id)
        .filter(Match.is_blocked.is_(False))
    )
    if days:
        cutoff = datetime.now(timezone.utc) - timedelta(days=int(days))
        q2 = q2.filter((Vacancy.published_at.is_(None)) | (Vacancy.published_at >= cutoff))
    if sort == "date":
        q2 = q2.order_by(Vacancy.published_at.desc().nullslast(), Match.score.desc())
    else:
        q2 = q2.order_by(Match.score.desc(), Vacancy.published_at.desc().nullslast())
    rows = q2.limit(limit).all()
    for v, m in rows:
        reasons = m.reasons_json or []
        items.append(
            VacancyListItem(
                id=v.id,
                source=v.source,
                external_vacancy_id=v.external_vacancy_id,
                title=v.title,
                employer_name=v.employer_name,
                area_name=v.area_name,
                salary_from=v.salary_from,
                salary_to=v.salary_to,
                published_at=v.published_at,
                apply_via_hh=v.apply_via_hh,
                external_apply_url=v.external_apply_url,
                score=float(m.score),
                is_blocked=bool(m.is_blocked),
                blocked_reason=m.blocked_reason,
                reasons=reasons if include_reasons else [],
            )
        )
    return VacancyListOut(items=items, next_cursor=None)


@router.get("/{vacancy_id}", response_model=VacancyDetailOut)
def get_vacancy(vacancy_id: uuid.UUID, db: Session = Depends(get_db)) -> VacancyDetailOut:
    v = db.get(Vacancy, vacancy_id)
    if v is None:
        raise HTTPException(status_code=404, detail="Вакансия не найдена.")
    return VacancyDetailOut(
        id=v.id,
        source=v.source,
        external_vacancy_id=v.external_vacancy_id,
        hh_url=v.hh_url,
        title=v.title,
        employer_id=v.employer_id,
        employer_name=v.employer_name,
        area_name=v.area_name,
        apply_via_hh=v.apply_via_hh,
        external_apply_url=v.external_apply_url,
        normalized={
            "experience": v.experience,
            "employment": v.employment,
            "schedule": v.schedule,
        },
    )


@router.post("/{vacancy_id}/match", response_model=MatchOut)
def create_match(vacancy_id: uuid.UUID, payload: MatchCreateIn, db: Session = Depends(get_db)) -> MatchOut:
    user = get_or_create_stub_user(db)
    v = db.get(Vacancy, vacancy_id)
    if v is None:
        raise HTTPException(status_code=404, detail="Вакансия не найдена.")
    sp = db.get(SearchProfile, payload.search_profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")

    now = datetime.now(timezone.utc)
    computed = compute_match(sp, v)

    m = (
        db.query(Match)
        .filter(Match.search_profile_id == payload.search_profile_id, Match.vacancy_id == vacancy_id)
        .one_or_none()
    )
    if m is None:
        m = Match(
            user_id=user.id,
            search_profile_id=payload.search_profile_id,
            vacancy_id=vacancy_id,
            score=computed["score"],
            reasons_json=computed["reasons"],
            missing_skills_json=computed["missing_skills"],
            is_blocked=computed["is_blocked"],
            blocked_reason=computed["blocked_reason"],
            computed_at=now,
        )
        db.add(m)
    else:
        m.score = computed["score"]
        m.reasons_json = computed["reasons"]
        m.missing_skills_json = computed["missing_skills"]
        m.is_blocked = computed["is_blocked"]
        m.blocked_reason = computed["blocked_reason"]
        m.computed_at = now
        db.add(m)
    db.commit()
    db.refresh(m)
    return MatchOut(
        id=m.id,
        vacancy_id=m.vacancy_id,
        search_profile_id=m.search_profile_id,
        score=float(m.score),
        reasons=m.reasons_json or [],
        missing_skills=m.missing_skills_json,
        is_blocked=bool(m.is_blocked),
        blocked_reason=m.blocked_reason,
    )


@router.post("/{vacancy_id}/cover-letter/generate", response_model=CoverLetterGenerateOut, status_code=201)
async def generate_cover_letter(
    vacancy_id: uuid.UUID, payload: CoverLetterGenerateIn, request: Request, db: Session = Depends(get_db)
) -> CoverLetterGenerateOut:
    user = get_or_create_stub_user(db)
    v = db.get(Vacancy, vacancy_id)
    if v is None:
        raise HTTPException(status_code=404, detail="Вакансия не найдена.")

    settings = request.app.state.settings
    request_id = getattr(request.state, "request_id", None)

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).one_or_none()
    if profile is None:
        raise HTTPException(
            status_code=409,
            detail={"error": {"code": "CANDIDATE_PROFILE_REQUIRED", "message": "Нужен профиль кандидата для генерации письма."}},
        )

    template: CoverTemplate | None = None
    if payload.template_id:
        template = db.get(CoverTemplate, payload.template_id)
    if template is None:
        template = db.query(CoverTemplate).filter(CoverTemplate.is_default.is_(True)).one_or_none()
    if template is None:
        template = db.query(CoverTemplate).order_by(CoverTemplate.created_at.desc()).limit(1).one_or_none()

    generator = CoverLetterGptGenerator(settings=settings, openai=OpenAIResponsesClient(settings=settings))

    try:
        structured = await generator.generate_cover_letter_gpt(
            vacancy=v,
            candidate_profile=profile,
            template=template,
            tone=payload.tone or "neutral",
            request_id=request_id,
        )
    except OpenAIUnavailable:
        raise HTTPException(status_code=503, detail={"error": {"code": "OPENAI_UNAVAILABLE", "message": "OpenAI недоступен."}})
    except OpenAIRequestFailed as e:
        raise HTTPException(status_code=502, detail={"error": {"code": "OPENAI_REQUEST_FAILED", "message": "Ошибка запроса к OpenAI.", "details": {"status_code": e.status_code}}})

    resume_allow: list[str] = []
    if payload.resume_id:
        cached = (
            db.query(HHResume)
            .filter(HHResume.user_id == user.id, HHResume.resume_id == payload.resume_id)
            .one_or_none()
        )
        if cached and cached.numbers_allowlist_json:
            resume_allow = cached.numbers_allowlist_json
    allow_union = list(dict.fromkeys((profile.facts_numbers_json or []) + resume_allow))

    validation = validate_cover_letter(
        letter_text=structured["letter_text"],
        numbers_used=structured["numbers_used"],
        allowlist_numbers=allow_union,
        settings=settings,
    )

    now = datetime.now(timezone.utc)
    status = "draft" if validation.is_valid else "draft_invalid"

    cl = CoverLetter(
        user_id=user.id,
        vacancy_id=vacancy_id,
        resume_id=payload.resume_id,
        template_id=template.id if template else None,
        status=status,
        text=structured["letter_text"],
        version=1,
        facts_used_json=structured["facts_used"],
        numbers_used_json=structured["numbers_used"],
        risk_flags_json=structured["risk_flags"],
        validation_json=validation.to_json(),
        generated_at=now,
    )
    db.add(cl)
    db.commit()
    db.refresh(cl)

    return CoverLetterGenerateOut(
        cover_letter_id=cl.id,
        letter_text=cl.text,
        status=cl.status,
        facts_used=cl.facts_used_json or [],
        numbers_used=cl.numbers_used_json or [],
        risk_flags=cl.risk_flags_json or [],
        validation=cl.validation_json or {"is_valid": False, "errors": [], "warnings": []},
    )

