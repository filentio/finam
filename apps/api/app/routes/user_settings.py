from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.user_settings import DefaultResumeIn, DefaultResumeOut
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/user", tags=["user_settings"])


@router.get("/default-resume", response_model=DefaultResumeOut)
def get_default_resume(db: Session = Depends(get_db)) -> DefaultResumeOut:
    user = get_or_create_stub_user(db)
    return DefaultResumeOut(resume_id=user.default_resume_id)


@router.put("/default-resume", response_model=DefaultResumeOut)
def set_default_resume(payload: DefaultResumeIn, db: Session = Depends(get_db)) -> DefaultResumeOut:
    user = get_or_create_stub_user(db)
    user.default_resume_id = payload.resume_id.strip() if payload.resume_id else None
    db.add(user)
    db.commit()
    db.refresh(user)
    return DefaultResumeOut(resume_id=user.default_resume_id)

