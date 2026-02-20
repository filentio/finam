from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
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
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/search-profiles", tags=["search_profiles"])


def _to_out(sp: SearchProfile) -> SearchProfileOut:
    return SearchProfileOut(
        id=sp.id,
        name=sp.name,
        is_active=sp.is_active,
        filters=sp.filters_json or {},
        stoplist=sp.stoplist_json or {},
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


@router.delete("/{profile_id}", status_code=204)
def delete_profile(profile_id: uuid.UUID, db: Session = Depends(get_db)) -> Response:
    user = get_or_create_stub_user(db)
    sp = db.get(SearchProfile, profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")
    db.delete(sp)
    db.commit()
    return Response(status_code=204)


@router.post("/{profile_id}/run", response_model=RunOut, status_code=202)
def run_profile(profile_id: uuid.UUID, db: Session = Depends(get_db)) -> RunOut:
    user = get_or_create_stub_user(db)
    sp = db.get(SearchProfile, profile_id)
    if sp is None or sp.user_id != user.id:
        raise HTTPException(status_code=404, detail="Профиль поиска не найден.")

    # Stage 3 scaffold: no real job queue integration yet.
    return RunOut(run_id=uuid.uuid4(), status="queued")

