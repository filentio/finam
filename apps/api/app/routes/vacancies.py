from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.cover_letter import CoverLetter
from app.models.match import Match
from app.models.search_profile import SearchProfile
from app.models.vacancy import Vacancy
from app.schemas.cover_letters import CoverLetterOut
from app.schemas.vacancies import (
    CoverLetterGenerateIn,
    MatchCreateIn,
    MatchOut,
    VacancyDetailOut,
    VacancyListOut,
    VacancyListItem,
)
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/vacancies", tags=["vacancies"])


@router.get("", response_model=VacancyListOut)
def list_vacancies(
    search_profile_id: uuid.UUID | None = None,
    limit: int = 50,
    cursor: str | None = None,
    db: Session = Depends(get_db),
) -> VacancyListOut:
    _ = cursor  # reserved for future cursor pagination
    user = get_or_create_stub_user(db)

    q = db.query(Vacancy)
    if limit <= 0 or limit > 200:
        raise HTTPException(status_code=400, detail="Некорректный limit.")

    items: list[VacancyListItem] = []

    if search_profile_id is None:
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
                    reasons=[],
                )
            )
        return VacancyListOut(items=items, next_cursor=None)

    sp = db.get(SearchProfile, search_profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")

    # Join matches for the given profile.
    rows = (
        db.query(Vacancy, Match)
        .join(Match, Match.vacancy_id == Vacancy.id)
        .filter(Match.search_profile_id == search_profile_id)
        .order_by(Match.score.desc(), Vacancy.published_at.desc().nullslast())
        .limit(limit)
        .all()
    )
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
                reasons=[] if reasons is None else reasons,  # reasons schema is flexible in scaffold
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
            score=0,
            reasons_json=[],
            computed_at=now,
        )
        db.add(m)
    else:
        m.score = 0
        m.reasons_json = []
        m.computed_at = now
        db.add(m)
    db.commit()
    db.refresh(m)
    return MatchOut(id=m.id, vacancy_id=m.vacancy_id, search_profile_id=m.search_profile_id, score=float(m.score), reasons=[])


@router.post("/{vacancy_id}/cover-letter/generate", response_model=CoverLetterOut, status_code=201)
def generate_cover_letter(
    vacancy_id: uuid.UUID, payload: CoverLetterGenerateIn, db: Session = Depends(get_db)
) -> CoverLetterOut:
    user = get_or_create_stub_user(db)
    v = db.get(Vacancy, vacancy_id)
    if v is None:
        raise HTTPException(status_code=404, detail="Вакансия не найдена.")

    now = datetime.now(timezone.utc)
    text = f"Здравствуйте! Меня заинтересовала вакансия «{v.title}». Готов(а) обсудить детали."

    cl = CoverLetter(
        user_id=user.id,
        vacancy_id=vacancy_id,
        resume_id=payload.resume_id,
        template_id=payload.template_id,
        status="draft",
        text=text,
        version=1,
        generated_at=now,
    )
    db.add(cl)
    db.commit()
    db.refresh(cl)
    return CoverLetterOut(
        id=cl.id,
        status=cl.status,
        text=cl.text,
        version=cl.version,
        vacancy_id=cl.vacancy_id,
        resume_id=cl.resume_id,
        generated_at=cl.generated_at,
    )

