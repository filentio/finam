from __future__ import annotations

import uuid
import asyncio

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.search_profile import SearchProfile
from app.schemas.search_profiles import (
    RunOut,
    SearchProfileCreate,
    SearchProfileList,
    SearchProfileOut,
    SearchProfileUpdate,
)
from app.schemas.search_template import SearchTemplateOut, SearchTemplateUpdateIn
from app.models.resume import Resume
from app.services.search_template_builder import build_template_from_resume
from app.services.public_search_pipeline import run_search_profile_public_ingestion
from app.services.hh_public_search import HHPublicBlocked
from app.utils.stub_auth import get_or_create_stub_user
from app.services.search_runner import run_search_profile_ingestion, run_search_profile_job


router = APIRouter(prefix="/search-profiles", tags=["search_profiles"])


def _to_out(sp: SearchProfile) -> SearchProfileOut:
    return SearchProfileOut(
        id=sp.id,
        name=sp.name,
        is_active=sp.is_active,
        filters=sp.filters_json or {},
        stoplist=sp.stoplist_json or {},
        generated_from_resume=bool(sp.generated_from_resume),
        template_json=sp.template_json,
        date_filter_days=sp.date_filter_days,
        sort_mode=sp.sort_mode or "relevance",
        updated_at=sp.updated_at,
    )


@router.get("", response_model=SearchProfileList)
def list_profiles(db: Session = Depends(get_db)) -> SearchProfileList:
    user = get_or_create_stub_user(db)
    items = (
        db.query(SearchProfile)
        .filter(SearchProfile.user_id == user.id)
        .order_by(SearchProfile.updated_at.desc())
        .all()
    )
    return SearchProfileList(items=[_to_out(x) for x in items])


@router.post("", response_model=SearchProfileOut, status_code=201)
def create_profile(payload: SearchProfileCreate, db: Session = Depends(get_db)) -> SearchProfileOut:
    user = get_or_create_stub_user(db)
    sp = SearchProfile(
        user_id=user.id,
        name=payload.name,
        filters_json=payload.filters,
        stoplist_json=payload.stoplist,
        is_active=payload.is_active,
    )
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return _to_out(sp)


@router.get("/{profile_id}", response_model=SearchProfileOut)
def get_profile(profile_id: uuid.UUID, db: Session = Depends(get_db)) -> SearchProfileOut:
    user = get_or_create_stub_user(db)
    sp = db.get(SearchProfile, profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")
    return _to_out(sp)


@router.patch("/{profile_id}", response_model=SearchProfileOut)
def update_profile(profile_id: uuid.UUID, payload: SearchProfileUpdate, db: Session = Depends(get_db)) -> SearchProfileOut:
    user = get_or_create_stub_user(db)
    sp = db.get(SearchProfile, profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")

    if payload.name is not None:
        sp.name = payload.name
    if payload.filters is not None:
        sp.filters_json = payload.filters
    if payload.stoplist is not None:
        sp.stoplist_json = payload.stoplist
    if payload.is_active is not None:
        sp.is_active = payload.is_active

    db.add(sp)
    db.commit()
    db.refresh(sp)
    return _to_out(sp)


@router.put("/{profile_id}", response_model=SearchProfileOut)
def replace_profile(profile_id: uuid.UUID, payload: SearchProfileUpdate, db: Session = Depends(get_db)) -> SearchProfileOut:
    # UI uses PUT; for MVP we treat it as a partial update (same as PATCH).
    return update_profile(profile_id=profile_id, payload=payload, db=db)


@router.delete("/{profile_id}", status_code=204)
def delete_profile(profile_id: uuid.UUID, db: Session = Depends(get_db)) -> Response:
    user = get_or_create_stub_user(db)
    sp = db.get(SearchProfile, profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")
    db.delete(sp)
    db.commit()
    return Response(status_code=204)


@router.post("/{profile_id}/generate-template-from-resume", response_model=SearchTemplateOut)
def generate_template_from_resume(profile_id: uuid.UUID, db: Session = Depends(get_db)) -> SearchTemplateOut:
    user = get_or_create_stub_user(db)
    sp = db.get(SearchProfile, profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")

    r = db.query(Resume).filter(Resume.user_id == user.id).one_or_none()
    if r is None or not isinstance(r.parsed_json, dict):
        raise HTTPException(status_code=409, detail={"code": "RESUME_REQUIRED", "message": "Сначала импортируйте резюме."})

    template = build_template_from_resume(r.parsed_json)
    sp.template_json = template
    sp.generated_from_resume = True
    if not sp.sort_mode:
        sp.sort_mode = "relevance"
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return SearchTemplateOut(template_json=template, date_filter_days=sp.date_filter_days, sort_mode=sp.sort_mode or "relevance")


@router.put("/{profile_id}/template", response_model=SearchTemplateOut)
def update_template(profile_id: uuid.UUID, payload: SearchTemplateUpdateIn, db: Session = Depends(get_db)) -> SearchTemplateOut:
    user = get_or_create_stub_user(db)
    sp = db.get(SearchProfile, profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")
    sp.template_json = payload.template_json
    sp.date_filter_days = payload.date_filter_days
    sp.sort_mode = payload.sort_mode
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return SearchTemplateOut(template_json=sp.template_json or {}, date_filter_days=sp.date_filter_days, sort_mode=sp.sort_mode or "relevance")


@router.post("/{profile_id}/run", response_model=RunOut, status_code=202)
async def run_profile(profile_id: uuid.UUID, request: Request, db: Session = Depends(get_db)) -> RunOut:
    user = get_or_create_stub_user(db)
    sp = db.get(SearchProfile, profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")

    request_id = getattr(request.state, "request_id", None)
    run_id = uuid.uuid4()

    # Public HTML search is fast enough for synchronous execution (and lets UI see errors).
    if sp.template_json:
        try:
            result = await run_search_profile_public_ingestion(
                db=db,
                user_id=user.id,
                search_profile_id=profile_id,
                request_id=request_id,
                max_pages=3 if request.app.state.settings.APP_ENV != "test" else 1,
                detail_top_k=10 if request.app.state.settings.APP_ENV != "test" else 2,
            )
        except HHPublicBlocked as e:
            raise HTTPException(status_code=503, detail={"code": e.code, "message": e.message})
        return RunOut(run_id=result.run_id, status="completed")

    # Legacy HH API search remains async background.
    if request.app.state.settings.APP_ENV == "test":
        await run_search_profile_ingestion(db=db, user_id=user.id, search_profile_id=profile_id, request_id=request_id, max_pages=1)
    else:
        asyncio.create_task(
            run_search_profile_job(
                session_local=request.app.state.SessionLocal,
                user_id=user.id,
                search_profile_id=profile_id,
                request_id=request_id,
            )
        )
    return RunOut(run_id=run_id, status="queued")

