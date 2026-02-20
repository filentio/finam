from __future__ import annotations

import logging
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.audit_log import AuditLog
from app.models.hh_account import HHAccount
from app.services.hh_oauth_client import (
    HHOAuthClient,
    HHOAuthNetworkError,
    HHOAuthTokenExchangeFailed,
)
from app.utils.stub_auth import get_or_create_stub_user


router = APIRouter(prefix="/auth/hh", tags=["auth_hh"])
logger = logging.getLogger(__name__)


def _state_key(state: str) -> str:
    return f"hh:oauth_state:{state}"


def _error(code: str, message: str, status_code: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": None}},
    )


@router.get("/status")
def hh_status(db: Session = Depends(get_db)) -> dict:
    user = get_or_create_stub_user(db)
    acc = db.query(HHAccount).filter(HHAccount.user_id == user.id).one_or_none()
    if acc is None:
        return {
            "connected": False,
            "account_status": "absent",
            "expires_at": None,
            "has_refresh_token": False,
            "last_connected_at": None,
        }
    connected = acc.status == "active" and bool(acc.access_token_ciphertext)
    return {
        "connected": connected,
        "account_status": acc.status,
        "expires_at": acc.token_expires_at.isoformat().replace("+00:00", "Z") if acc.token_expires_at else None,
        "has_refresh_token": bool(acc.refresh_token_ciphertext),
        "last_connected_at": acc.connected_at.isoformat().replace("+00:00", "Z") if acc.connected_at else None,
    }


@router.get("/start")
def hh_start(
    request: Request,
    force_login: bool = False,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    settings = request.app.state.settings
    user = get_or_create_stub_user(db)

    state = secrets.token_urlsafe(32)
    try:
        request.app.state.redis.setex(_state_key(state), settings.AUTH_STATE_TTL_SECONDS, str(user.id))
    except Exception:
        logger.exception("Failed to store oauth state", extra={"request_id": getattr(request.state, "request_id", None)})
        raise HTTPException(status_code=503, detail="State storage is unavailable.")

    try:
        url = HHOAuthClient(settings).build_authorize_url(state=state, force_login=force_login)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    db.add(
        AuditLog(
            user_id=user.id,
            entity_type="hh_account",
            entity_id=user.id,  # placeholder entity id for start
            action="auth_start",
            metadata_json={"force_login": force_login},
        )
    )
    db.commit()

    return RedirectResponse(url=url, status_code=302)


@router.get("/callback")
async def hh_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    error_description: str | None = None,
    db: Session = Depends(get_db),
) -> JSONResponse:
    _ = error_description  # do not expose or log
    settings = request.app.state.settings
    user = get_or_create_stub_user(db)

    if error:
        return _error("HH_OAUTH_ERROR", "HH вернул ошибку OAuth.", status_code=400)
    if not code or not state:
        return _error("VALIDATION_ERROR", "Отсутствуют обязательные параметры code/state.", status_code=400)

    key = _state_key(state)
    try:
        stored_user_id = request.app.state.redis.get(key)
    except Exception:
        logger.exception("Failed to read oauth state", extra={"request_id": getattr(request.state, "request_id", None)})
        return _error("STATE_STORAGE_UNAVAILABLE", "State storage is unavailable.", status_code=503)

    if not stored_user_id:
        return _error("INVALID_STATE", "Некорректный или просроченный state.", status_code=400)
    if stored_user_id != str(user.id):
        return _error("STATE_MISMATCH", "State не принадлежит текущему пользователю.", status_code=403)

    try:
        token = await HHOAuthClient(settings).exchange_code_for_token(code=code)
    except HHOAuthNetworkError:
        logger.exception("Token exchange network error", extra={"request_id": getattr(request.state, "request_id", None)})
        return _error("HH_UNAVAILABLE", "HH недоступен. Попробуйте позже.", status_code=503)
    except HHOAuthTokenExchangeFailed:
        logger.exception("Token exchange failed", extra={"request_id": getattr(request.state, "request_id", None)})
        return _error("HH_TOKEN_EXCHANGE_FAILED", "Не удалось обменять code на token.", status_code=400)

    now = datetime.now(timezone.utc)
    acc = db.query(HHAccount).filter(HHAccount.user_id == user.id).one_or_none()
    if acc is None:
        acc = HHAccount(user_id=user.id)
        db.add(acc)
        db.flush()

    acc.status = "active"
    acc.access_token_ciphertext = token.access_token
    acc.refresh_token_ciphertext = token.refresh_token
    acc.token_expires_at = token.expires_at
    acc.scopes_json = token.scopes
    acc.connected_at = now
    acc.disconnected_at = None
    db.add(acc)

    db.add(
        AuditLog(
            user_id=user.id,
            entity_type="hh_account",
            entity_id=acc.id,
            action="auth_callback_success",
            metadata_json={"has_refresh_token": bool(token.refresh_token), "expires_at": acc.token_expires_at.isoformat() if acc.token_expires_at else None},
        )
    )

    db.commit()

    try:
        request.app.state.redis.delete(key)
    except Exception:
        # not critical; state has TTL
        logger.warning("Failed to delete oauth state", extra={"request_id": getattr(request.state, "request_id", None)})

    return JSONResponse(status_code=200, content={"connected": True, "reauth_required": False})


@router.post("/disconnect")
def hh_disconnect(request: Request, db: Session = Depends(get_db)) -> JSONResponse:
    user = get_or_create_stub_user(db)
    acc = db.query(HHAccount).filter(HHAccount.user_id == user.id).one_or_none()
    if acc is None:
        return JSONResponse(status_code=200, content={"connected": False})

    now = datetime.now(timezone.utc)
    acc.status = "revoked"
    acc.access_token_ciphertext = ""
    acc.refresh_token_ciphertext = None
    acc.token_expires_at = None
    acc.scopes_json = None
    acc.disconnected_at = now
    db.add(acc)

    db.add(
        AuditLog(
            user_id=user.id,
            entity_type="hh_account",
            entity_id=acc.id,
            action="auth_disconnect",
            metadata_json={},
        )
    )
    db.commit()

    return JSONResponse(status_code=200, content={"connected": False})

