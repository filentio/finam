from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.candidate_profile import CandidateProfile
from app.schemas.candidate_profile import CandidateProfileOut, CandidateProfileUpsertIn
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/candidate-profile", tags=["candidate_profile"])


def _to_out(cp: CandidateProfile) -> CandidateProfileOut:
    return CandidateProfileOut(
        id=cp.id,
        full_name=cp.full_name,
        desired_role=cp.desired_role,
        summary=cp.summary,
        skills_json=cp.skills_json,
        achievements_json=cp.achievements_json,
        links_json=cp.links_json,
        facts_numbers_json=cp.facts_numbers_json,
        updated_at=cp.updated_at,
    )


@router.get("", response_model=CandidateProfileOut)
def get_candidate_profile(db: Session = Depends(get_db)) -> CandidateProfileOut:
    user = get_or_create_stub_user(db)
    cp = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).one_or_none()
    if cp is None:
        cp = CandidateProfile(user_id=user.id)
        db.add(cp)
        db.commit()
        db.refresh(cp)
    return _to_out(cp)


@router.put("", response_model=CandidateProfileOut)
def upsert_candidate_profile(payload: CandidateProfileUpsertIn, db: Session = Depends(get_db)) -> CandidateProfileOut:
    user = get_or_create_stub_user(db)
    cp = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).one_or_none()
    if cp is None:
        cp = CandidateProfile(user_id=user.id)
        db.add(cp)
        db.flush()

    if payload.full_name is not None:
        cp.full_name = payload.full_name
    if payload.desired_role is not None:
        cp.desired_role = payload.desired_role
    if payload.summary is not None:
        cp.summary = payload.summary
    if payload.skills_json is not None:
        cp.skills_json = payload.skills_json
    if payload.achievements_json is not None:
        cp.achievements_json = payload.achievements_json
    if payload.links_json is not None:
        cp.links_json = [x.model_dump() for x in payload.links_json]
    if payload.facts_numbers_json is not None:
        cp.facts_numbers_json = payload.facts_numbers_json

    db.add(cp)
    db.commit()
    db.refresh(cp)
    return _to_out(cp)

