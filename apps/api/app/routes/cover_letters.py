from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.cover_letter import CoverLetter
from app.schemas.cover_letters import CoverLetterEditIn, CoverLetterOut
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/cover-letters", tags=["cover_letters"])


@router.put("/{cover_letter_id}", response_model=CoverLetterOut)
def edit_cover_letter(cover_letter_id: uuid.UUID, payload: CoverLetterEditIn, db: Session = Depends(get_db)) -> CoverLetterOut:
    user = get_or_create_stub_user(db)
    cl = db.get(CoverLetter, cover_letter_id)
    if cl is None or cl.user_id != user.id:
        raise HTTPException(status_code=404, detail="Черновик письма не найден.")

    cl.text = payload.text
    cl.status = "edited"
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
    )

