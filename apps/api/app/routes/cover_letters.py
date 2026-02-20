from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.candidate_profile import CandidateProfile
from app.models.cover_letter import CoverLetter
from app.schemas.cover_letters import CoverLetterEditIn, CoverLetterOut
from app.services.cover_letter_validator import validate_cover_letter
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/cover-letters", tags=["cover_letters"])


@router.put("/{cover_letter_id}", response_model=CoverLetterOut)
def edit_cover_letter(
    cover_letter_id: uuid.UUID, payload: CoverLetterEditIn, request: Request, db: Session = Depends(get_db)
) -> CoverLetterOut:
    user = get_or_create_stub_user(db)
    cl = db.get(CoverLetter, cover_letter_id)
    if cl is None or cl.user_id != user.id:
        raise HTTPException(status_code=404, detail="Черновик письма не найден.")

    settings_obj = request.app.state.settings
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).one_or_none()
    allow = profile.facts_numbers_json if profile else None

    cl.text = payload.text
    validation = validate_cover_letter(
        letter_text=cl.text,
        numbers_used=cl.numbers_used_json or [],
        allowlist_numbers=allow or [],
        settings=settings_obj,
    )
    cl.validation_json = validation.to_json()
    cl.status = "edited" if validation.is_valid else "draft_invalid"
    cl.version = (cl.version or 1) + 1
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
        facts_used=cl.facts_used_json,
        numbers_used=cl.numbers_used_json,
        risk_flags=cl.risk_flags_json,
        validation=cl.validation_json,
    )

