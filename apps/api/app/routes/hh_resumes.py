from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.hh_account import HHAccount
from app.models.hh_resume import HHResume
from app.schemas.hh_resumes import HHResumeCachedOut, HHResumeCacheOut, HHResumeListItem, HHResumeListOut
from app.services.hh_api_client import HHApiClient, HHApiRequestFailed, HHApiUnavailable
from app.services.hh_normalizer import parse_hh_datetime
from app.services.resume_normalizer import extract_numbers_allowlist, normalize_resume_to_text
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/hh/resumes", tags=["hh_resumes"])


def _require_hh_token(db: Session, user_id) -> str:
    acc = db.query(HHAccount).filter(HHAccount.user_id == user_id).one_or_none()
    if acc is None or acc.status != "active" or not acc.access_token_ciphertext:
        raise HTTPException(status_code=409, detail={"code": "HH_NOT_CONNECTED", "message": "HH OAuth не подключён."})
    return acc.access_token_ciphertext


@router.get("", response_model=HHResumeListOut)
async def list_hh_resumes(request: Request, db: Session = Depends(get_db)) -> HHResumeListOut:
    user = get_or_create_stub_user(db)
    token = _require_hh_token(db, user.id)
    request_id = getattr(request.state, "request_id", None)
    try:
        raw = await HHApiClient().list_resumes(access_token=token, request_id=request_id)
    except HHApiUnavailable:
        raise HTTPException(status_code=503, detail={"code": "HH_UNAVAILABLE", "message": "HH недоступен."})
    except HHApiRequestFailed as e:
        raise HTTPException(status_code=502, detail={"code": "HH_REQUEST_FAILED", "message": "HH API request failed.", "details": {"status_code": e.status_code}})

    items_raw = raw.get("items") if isinstance(raw, dict) else None
    if items_raw is None and isinstance(raw, list):
        items_raw = raw
    if not isinstance(items_raw, list):
        items_raw = []

    items: list[HHResumeListItem] = []
    for it in items_raw:
        if not isinstance(it, dict):
            continue
        rid = str(it.get("id") or "").strip()
        if not rid:
            continue
        title = it.get("title") or it.get("name")
        updated = parse_hh_datetime(it.get("updated_at") or it.get("updated"))
        items.append(HHResumeListItem(id=rid, title=str(title) if title else None, updated_at=updated))

    return HHResumeListOut(items=items)


@router.post("/{resume_id}/cache", response_model=HHResumeCacheOut)
async def cache_resume(resume_id: str, request: Request, db: Session = Depends(get_db)) -> HHResumeCacheOut:
    user = get_or_create_stub_user(db)
    token = _require_hh_token(db, user.id)
    request_id = getattr(request.state, "request_id", None)

    try:
        raw = await HHApiClient().get_resume(resume_id=resume_id, access_token=token, request_id=request_id)
    except HHApiUnavailable:
        raise HTTPException(status_code=503, detail={"code": "HH_UNAVAILABLE", "message": "HH недоступен."})
    except HHApiRequestFailed as e:
        raise HTTPException(status_code=502, detail={"code": "HH_REQUEST_FAILED", "message": "HH API request failed.", "details": {"status_code": e.status_code}})

    title = raw.get("title") or raw.get("name") or raw.get("position")
    updated_at_from_hh = parse_hh_datetime(raw.get("updated_at") or raw.get("updated"))
    normalized_text = normalize_resume_to_text(raw)
    numbers_allow = extract_numbers_allowlist(normalized_text, raw_json=raw)

    existing = db.query(HHResume).filter(HHResume.user_id == user.id, HHResume.resume_id == str(resume_id)).one_or_none()
    if existing is None:
        existing = HHResume(user_id=user.id, resume_id=str(resume_id).strip())
        db.add(existing)
        db.flush()

    existing.title = str(title) if title else None
    existing.updated_at_from_hh = updated_at_from_hh
    existing.raw_json = raw
    existing.normalized_text = normalized_text
    existing.numbers_allowlist_json = numbers_allow
    db.add(existing)
    db.commit()
    db.refresh(existing)

    now = datetime.now(timezone.utc)
    return HHResumeCacheOut(resume_id=existing.resume_id, title=existing.title, cached_at=now)


@router.get("/{resume_id}", response_model=HHResumeCachedOut)
def get_cached_resume(
    resume_id: str,
    include_raw: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> HHResumeCachedOut:
    user = get_or_create_stub_user(db)
    r = db.query(HHResume).filter(HHResume.user_id == user.id, HHResume.resume_id == str(resume_id)).one_or_none()
    if r is None:
        raise HTTPException(status_code=404, detail="Resume cache not found.")
    return HHResumeCachedOut(
        resume_id=r.resume_id,
        title=r.title,
        updated_at_from_hh=r.updated_at_from_hh,
        normalized_text=r.normalized_text,
        numbers_allowlist=r.numbers_allowlist_json or [],
        raw_json=r.raw_json if include_raw else None,
    )

