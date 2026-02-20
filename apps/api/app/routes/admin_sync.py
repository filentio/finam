from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.hh_account import HHAccount
from app.schemas.common import APIModel
from app.services.negotiations_sync import sync_user_negotiations


router = APIRouter(prefix="/admin/sync", tags=["admin_sync"])


class SyncNegotiationsIn(APIModel):
    user_id: uuid.UUID | None = None
    mode: str = "by_ids"


class SyncNegotiationsOut(APIModel):
    updated_count: int
    errors_count: int
    rate_limited: bool
    unauthorized: bool
    duration_ms: int


def _require_admin(request: Request, admin_token: str | None) -> None:
    configured = request.app.state.settings.ADMIN_SYNC_TOKEN
    if not configured:
        raise HTTPException(status_code=503, detail="ADMIN_SYNC_TOKEN is not configured.")
    if not admin_token or admin_token != configured:
        raise HTTPException(status_code=403, detail="Forbidden.")


@router.post("/negotiations", response_model=SyncNegotiationsOut)
async def sync_negotiations(
    payload: SyncNegotiationsIn,
    request: Request,
    db: Session = Depends(get_db),
    admin_token: str | None = Header(default=None, alias="X-Admin-Token"),
) -> SyncNegotiationsOut:
    _require_admin(request, admin_token)

    request_id = getattr(request.state, "request_id", None)
    max_items = request.app.state.settings.MAX_NEGOTIATIONS_PER_SYNC

    if payload.user_id:
        stats = await sync_user_negotiations(
            db=db, user_id=payload.user_id, mode=payload.mode, request_id=request_id, max_items=max_items
        )
        return SyncNegotiationsOut(
            updated_count=stats.updated,
            errors_count=stats.errors,
            rate_limited=stats.rate_limited,
            unauthorized=stats.unauthorized,
            duration_ms=stats.duration_ms,
        )

    # If no user_id provided: sync all active accounts (best-effort)
    accounts = db.query(HHAccount).filter(HHAccount.status == "active").all()
    total_updated = 0
    total_errors = 0
    any_rate_limited = False
    any_unauthorized = False
    started = datetime.now(timezone.utc)

    for acc in accounts:
        stats = await sync_user_negotiations(
            db=db, user_id=acc.user_id, mode=payload.mode, request_id=request_id, max_items=max_items
        )
        total_updated += stats.updated
        total_errors += stats.errors
        any_rate_limited = any_rate_limited or stats.rate_limited
        any_unauthorized = any_unauthorized or stats.unauthorized
        if stats.rate_limited or stats.unauthorized:
            break

    duration_ms = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
    return SyncNegotiationsOut(
        updated_count=total_updated,
        errors_count=total_errors,
        rate_limited=any_rate_limited,
        unauthorized=any_unauthorized,
        duration_ms=duration_ms,
    )

