from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.application import Application
from app.models.audit_log import AuditLog
from app.models.idempotency_key import IdempotencyKey
from app.models.vacancy import Vacancy
from app.schemas.applications import ApplicationCreateIn, ApplicationListOut, ApplicationOut
from app.utils.idempotency import stable_hash
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/applications", tags=["applications"])


def _to_out(a: Application) -> ApplicationOut:
    return ApplicationOut(
        id=a.id,
        status=a.status,
        vacancy_id=a.vacancy_id,
        resume_id=a.resume_id,
        cover_letter_id=a.cover_letter_id,
        approved_at=a.approved_at,
        queued_at=a.queued_at,
        sent_at=a.sent_at,
        error_code=a.error_code,
        error_message=a.error_message,
        last_attempt_at=a.last_attempt_at,
        attempt_count=a.attempt_count,
        created_at=a.created_at,
    )


@router.get("", response_model=ApplicationListOut)
def list_applications(
    status: str | None = None,
    limit: int = 50,
    cursor: str | None = None,
    db: Session = Depends(get_db),
) -> ApplicationListOut:
    _ = cursor
    user = get_or_create_stub_user(db)
    if limit <= 0 or limit > 200:
        raise HTTPException(status_code=400, detail="Некорректный limit.")
    q = db.query(Application).filter(Application.user_id == user.id)
    if status is not None:
        q = q.filter(Application.status == status)
    items = q.order_by(Application.created_at.desc()).limit(limit).all()
    return ApplicationListOut(items=[_to_out(x) for x in items], next_cursor=None)


@router.post("", response_model=ApplicationOut, status_code=201)
def create_application(payload: ApplicationCreateIn, db: Session = Depends(get_db)) -> ApplicationOut:
    user = get_or_create_stub_user(db)
    v = db.get(Vacancy, payload.vacancy_id)
    if v is None:
        raise HTTPException(status_code=404, detail="Вакансия не найдена.")

    a = Application(
        user_id=user.id,
        vacancy_id=payload.vacancy_id,
        resume_id=payload.resume_id,
        cover_letter_id=payload.cover_letter_id,
        status="draft",
        attempt_count=0,
    )
    db.add(a)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail={"code": "DUPLICATE_APPLICATION", "message": "Отклик уже существует."})
    db.refresh(a)
    db.add(
        AuditLog(
            user_id=user.id,
            entity_type="application",
            entity_id=a.id,
            action="created",
            metadata_json={"vacancy_id": str(a.vacancy_id), "resume_id": a.resume_id},
        )
    )
    db.commit()
    return _to_out(a)


@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(application_id: uuid.UUID, db: Session = Depends(get_db)) -> ApplicationOut:
    user = get_or_create_stub_user(db)
    a = db.get(Application, application_id)
    if a is None or a.user_id != user.id:
        raise HTTPException(status_code=404, detail="Отклик не найден.")
    return _to_out(a)


@router.post("/{application_id}/approve", response_model=ApplicationOut)
def approve_application(application_id: uuid.UUID, db: Session = Depends(get_db)) -> ApplicationOut:
    user = get_or_create_stub_user(db)
    a = db.get(Application, application_id)
    if a is None or a.user_id != user.id:
        raise HTTPException(status_code=404, detail="Отклик не найден.")
    if a.status != "draft":
        raise HTTPException(status_code=409, detail="Отклик нельзя одобрить из текущего статуса.")

    now = datetime.now(timezone.utc)
    a.status = "approved"
    a.approved_at = now
    db.add(a)
    db.add(
        AuditLog(
            user_id=user.id,
            entity_type="application",
            entity_id=a.id,
            action="approved",
            metadata_json={"vacancy_id": str(a.vacancy_id), "resume_id": a.resume_id},
        )
    )
    db.commit()
    db.refresh(a)
    return _to_out(a)


@router.post("/{application_id}/send", status_code=202)
def send_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict:
    """
    Stage 3 scaffold:
    - требует Idempotency-Key
    - переводит approved -> queued (без реальной отправки в HH)
    - повторный запрос с тем же ключом возвращает тот же ответ
    """
    user = get_or_create_stub_user(db)
    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Idempotency-Key обязателен.")

    a = db.get(Application, application_id)
    if a is None or a.user_id != user.id:
        raise HTTPException(status_code=404, detail="Отклик не найден.")

    scope = "application.send"
    req_hash = stable_hash(str(user.id), scope, str(application_id))

    existing = (
        db.query(IdempotencyKey)
        .filter(IdempotencyKey.user_id == user.id, IdempotencyKey.scope == scope, IdempotencyKey.key == idempotency_key)
        .one_or_none()
    )
    if existing is not None:
        if existing.request_hash != req_hash or existing.entity_id != application_id:
            raise HTTPException(status_code=409, detail={"code": "VALIDATION_ERROR", "message": "Конфликт ключа идемпотентности."})
        if existing.status_code is not None and existing.response_json is not None:
            return JSONResponse(content=existing.response_json, status_code=existing.status_code)
        # fallthrough: record exists but response not saved (shouldn't happen)

    if a.status != "approved":
        raise HTTPException(status_code=409, detail="Отклик можно отправить только после одобрения.")

    now = datetime.now(timezone.utc)
    a.status = "queued"
    a.queued_at = now
    a.last_attempt_at = now
    a.attempt_count = (a.attempt_count or 0) + 1
    db.add(a)

    response = {"id": str(a.id), "status": a.status, "last_attempt_at": now.isoformat().replace("+00:00", "Z")}

    idem = IdempotencyKey(
        user_id=user.id,
        scope=scope,
        key=idempotency_key,
        entity_id=application_id,
        request_hash=req_hash,
        status_code=202,
        response_json=response,
        expires_at=now + timedelta(hours=24),
    )
    db.add(idem)
    db.add(
        AuditLog(
            user_id=user.id,
            entity_type="application",
            entity_id=a.id,
            action="send_requested",
            metadata_json={"vacancy_id": str(a.vacancy_id), "resume_id": a.resume_id, "idempotency_key": idempotency_key},
        )
    )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # If idempotency key was concurrently inserted, retry read-path once
        existing2 = (
            db.query(IdempotencyKey)
            .filter(
                IdempotencyKey.user_id == user.id,
                IdempotencyKey.scope == scope,
                IdempotencyKey.key == idempotency_key,
            )
            .one_or_none()
        )
        if existing2 and existing2.response_json:
            return JSONResponse(content=existing2.response_json, status_code=existing2.status_code or 200)
        raise

    return JSONResponse(content=response, status_code=202)

