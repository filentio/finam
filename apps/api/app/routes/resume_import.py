from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.resume import Resume
from app.models.resume_source import ResumeSource
from app.schemas.resume_import import ResumeGetOut, ResumeImportOut, ResumeFromUrlIn, ResumeParsed, ResumeSourceOut, ResumeStats
from app.services.resume_parser import numbers_allowlist, parse_resume, parse_stats
from app.services.resume_text_extractor import (
    MAX_FILE_BYTES,
    ResumeImportError,
    ResumeUrlNotPublic,
    enforce_max_file_size,
    extract_text_from_bytes,
    fetch_public_resume_url,
)
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/resume", tags=["resume"])


def _source_to_out(s: ResumeSource) -> ResumeSourceOut:
    return ResumeSourceOut(
        id=str(s.id),
        source_type=s.source_type,
        source_url=s.source_url,
        file_name=s.file_name,
        file_mime=s.file_mime,
        status=s.status,
        error_code=s.error_code,
        error_text=s.error_text,
        created_at=s.created_at,
        updated_at=s.updated_at,
    )


def _resume_to_out(r: Resume, source: ResumeSource | None, *, include_raw: bool) -> ResumeGetOut:
    parsed = r.parsed_json or None
    keywords = r.keywords_json or []
    nums = r.numbers_allowlist_json or []
    return ResumeGetOut(
        exists=True,
        updated_at=r.updated_at,
        source=_source_to_out(source) if source else None,
        parsed=ResumeParsed.model_validate(parsed) if isinstance(parsed, dict) else None,
        keywords=[x for x in keywords if isinstance(x, str)],
        numbers_allowlist=[x for x in nums if isinstance(x, str)],
        raw_text=r.raw_text if include_raw else None,
    )


def _read_uploadfile_limited(upload: UploadFile, max_bytes: int) -> bytes:
    # Starlette UploadFile is sync file-like; reading is awaitable but may load into memory.
    # For MVP we read fully but enforce max size.
    data = upload.file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise ResumeImportError("FILE_TOO_LARGE", f"Файл слишком большой (>{max_bytes // (1024 * 1024)}MB).")
    return data


@router.get("", response_model=ResumeGetOut)
def get_resume(include_raw: bool = Query(default=False), db: Session = Depends(get_db)) -> ResumeGetOut:
    user = get_or_create_stub_user(db)
    r = db.query(Resume).filter(Resume.user_id == user.id).one_or_none()
    if r is None:
        return ResumeGetOut(exists=False, updated_at=None, source=None, parsed=None, raw_text=None)
    source = db.get(ResumeSource, r.active_source_id) if r.active_source_id else None
    return _resume_to_out(r, source, include_raw=include_raw)


@router.post("/from-url", response_model=ResumeImportOut)
async def import_from_url(payload: ResumeFromUrlIn, db: Session = Depends(get_db)) -> ResumeImportOut:
    user = get_or_create_stub_user(db)

    src = ResumeSource(user_id=user.id, source_type="url", source_url=payload.url, status="new")
    db.add(src)
    db.commit()
    db.refresh(src)

    try:
        fetched = await fetch_public_resume_url(payload.url)
        src.status = "fetched"
        db.add(src)
        db.commit()

        text, warnings = extract_text_from_bytes(data=fetched.body, file_name=None, content_type=fetched.content_type)
        if "HTML_DOES_NOT_LOOK_LIKE_RESUME" in warnings:
            raise ResumeUrlNotPublic("RESUME_URL_NOT_PUBLIC", "Страница по ссылке не похожа на публичное резюме.")

        parsed = parse_resume(text)
        stats = parse_stats(text)
        nums = numbers_allowlist(text)
        keywords = parsed.get("keywords") if isinstance(parsed, dict) else []
        if not isinstance(keywords, list):
            keywords = []

        # Upsert resume (one per user)
        r = db.query(Resume).filter(Resume.user_id == user.id).one_or_none()
        if r is None:
            r = Resume(user_id=user.id)
            db.add(r)
            db.flush()

        r.active_source_id = src.id
        r.raw_text = text
        r.parsed_json = parsed
        r.keywords_json = [x for x in keywords if isinstance(x, str)]
        r.numbers_allowlist_json = nums
        db.add(r)

        src.status = "parsed"
        src.error_code = None
        src.error_text = None
        db.add(src)

        db.commit()
        db.refresh(r)
        db.refresh(src)

        rp = ResumeParsed.model_validate(parsed)
        return ResumeImportOut(
            parsed=rp,
            stats=ResumeStats(**stats),
            warnings=warnings,
            keywords=rp.keywords,
            numbers_allowlist=nums,
            raw_text_preview=(text[:2000] + "…") if len(text) > 2000 else text,
        )
    except ResumeImportError as e:
        src.status = "failed"
        src.error_code = e.code
        src.error_text = e.message
        db.add(src)
        db.commit()

        if e.code == "INVALID_URL":
            raise HTTPException(status_code=422, detail={"code": "INVALID_URL", "message": e.message})
        if e.code == "RESUME_URL_NOT_PUBLIC":
            raise HTTPException(status_code=409, detail={"code": "RESUME_URL_NOT_PUBLIC", "message": e.message})
        if e.code == "RESUME_FETCH_FAILED":
            raise HTTPException(status_code=502, detail={"code": "RESUME_FETCH_FAILED", "message": e.message})
        raise HTTPException(status_code=422, detail={"code": e.code, "message": e.message})


@router.post("/upload", response_model=ResumeImportOut)
def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)) -> ResumeImportOut:
    user = get_or_create_stub_user(db)

    src = ResumeSource(
        user_id=user.id,
        source_type="file",
        file_name=file.filename,
        file_mime=file.content_type,
        status="new",
    )
    db.add(src)
    db.commit()
    db.refresh(src)

    try:
        data = _read_uploadfile_limited(file, MAX_FILE_BYTES)
        enforce_max_file_size(data, max_bytes=MAX_FILE_BYTES)
        src.status = "fetched"
        db.add(src)
        db.commit()

        text, warnings = extract_text_from_bytes(data=data, file_name=file.filename, content_type=file.content_type)
        parsed = parse_resume(text)
        stats = parse_stats(text)
        nums = numbers_allowlist(text)
        keywords = parsed.get("keywords") if isinstance(parsed, dict) else []
        if not isinstance(keywords, list):
            keywords = []

        r = db.query(Resume).filter(Resume.user_id == user.id).one_or_none()
        if r is None:
            r = Resume(user_id=user.id)
            db.add(r)
            db.flush()

        r.active_source_id = src.id
        r.raw_text = text
        r.parsed_json = parsed
        r.keywords_json = [x for x in keywords if isinstance(x, str)]
        r.numbers_allowlist_json = nums
        db.add(r)

        src.status = "parsed"
        src.error_code = None
        src.error_text = None
        db.add(src)

        db.commit()
        db.refresh(r)
        db.refresh(src)

        rp = ResumeParsed.model_validate(parsed)
        return ResumeImportOut(
            parsed=rp,
            stats=ResumeStats(**stats),
            warnings=warnings,
            keywords=rp.keywords,
            numbers_allowlist=nums,
            raw_text_preview=(text[:2000] + "…") if len(text) > 2000 else text,
        )
    except ResumeImportError as e:
        src.status = "failed"
        src.error_code = e.code
        src.error_text = e.message
        db.add(src)
        db.commit()

        if e.code == "FILE_TOO_LARGE":
            raise HTTPException(status_code=413, detail={"code": "FILE_TOO_LARGE", "message": e.message})
        if e.code == "UNSUPPORTED_FILE_TYPE":
            raise HTTPException(status_code=415, detail={"code": "UNSUPPORTED_FILE_TYPE", "message": e.message})
        if e.code == "TEXT_EXTRACT_FAILED":
            raise HTTPException(status_code=422, detail={"code": "TEXT_EXTRACT_FAILED", "message": e.message})
        raise HTTPException(status_code=422, detail={"code": e.code, "message": e.message})

