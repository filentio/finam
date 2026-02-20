from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.audit_log import AuditLog
from app.models.hh_account import HHAccount
from app.services.hh_api_client import HHApiClient, HHApiRequestFailed, HHApiUnavailable
from app.services.negotiations_status import normalize_negotiation_status, sanitize_negotiation_payload
from app.services.negotiations_sync_metrics import (
    hh_sync_duration_seconds,
    hh_sync_errors_total,
    hh_sync_runs_total,
    hh_sync_updated_total,
    hh_unauthorized_accounts_total,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SyncStats:
    mode: str
    scanned: int
    updated: int
    errors: int
    unauthorized: bool
    rate_limited: bool
    duration_ms: int


def _set_sync_error(a: Application, code: str, text: str) -> None:
    a.sync_error_code = code
    a.sync_error_text = text
    a.last_synced_at = datetime.now(timezone.utc)


async def sync_user_negotiations(
    *,
    db: Session,
    user_id: uuid.UUID,
    mode: str = "by_ids",
    request_id: str | None = None,
    max_items: int = 200,
    hh_client: HHApiClient | None = None,
) -> SyncStats:
    start = time.time()
    scanned = 0
    updated = 0
    errors = 0
    unauthorized = False
    rate_limited = False

    hh_client = hh_client or HHApiClient()

    db.add(
        AuditLog(
            user_id=user_id,
            entity_type="hh_account",
            entity_id=user_id,
            action="negotiations_sync_started",
            metadata_json={"mode": mode, "max_items": max_items},
        )
    )
    db.commit()

    with hh_sync_duration_seconds.time():
        try:
            acc = db.query(HHAccount).filter(HHAccount.user_id == user_id).one_or_none()
            if acc is None or acc.status != "active" or not acc.access_token_ciphertext:
                hh_sync_errors_total.labels(code="HH_NOT_CONNECTED").inc()
                hh_sync_runs_total.labels(status="failed").inc()
                return SyncStats(
                    mode=mode,
                    scanned=0,
                    updated=0,
                    errors=1,
                    unauthorized=False,
                    rate_limited=False,
                    duration_ms=int((time.time() - start) * 1000),
                )

            token = acc.access_token_ciphertext

            if mode != "by_ids":
                mode = "by_ids"

            apps = (
                db.query(Application)
                .filter(Application.user_id == user_id)
                .filter(Application.status == "sent")
                .filter(Application.external_application_id.isnot(None))
                .order_by(Application.last_synced_at.is_(None).desc(), Application.last_synced_at.asc().nullslast())
                .limit(max_items)
                .all()
            )

            for a in apps:
                scanned += 1
                try:
                    payload = await hh_client.get_negotiation(
                        negotiation_id=str(a.external_application_id),
                        access_token=token,
                        request_id=request_id,
                    )
                except HHApiRequestFailed as e:
                    errors += 1
                    if e.status_code == 401:
                        unauthorized = True
                        acc.status = "reauth_required"
                        db.add(acc)
                        _set_sync_error(a, "HH_UNAUTHORIZED", "Требуется повторная авторизация HH.")
                        db.add(a)
                        db.commit()
                        hh_sync_errors_total.labels(code="HH_UNAUTHORIZED").inc()
                        break
                    if e.status_code == 429:
                        rate_limited = True
                        _set_sync_error(a, "HH_RATE_LIMIT", "HH ограничил частоту запросов (429).")
                        db.add(a)
                        db.commit()
                        hh_sync_errors_total.labels(code="HH_RATE_LIMIT").inc()
                        break
                    _set_sync_error(a, f"HH_{e.status_code}", "HH вернул ошибку при синхронизации.")
                    db.add(a)
                    db.commit()
                    hh_sync_errors_total.labels(code="HH_ERROR").inc()
                    continue
                except HHApiUnavailable:
                    errors += 1
                    _set_sync_error(a, "HH_UNAVAILABLE", "HH временно недоступен.")
                    db.add(a)
                    db.commit()
                    hh_sync_errors_total.labels(code="HH_UNAVAILABLE").inc()
                    break

                norm = normalize_negotiation_status(payload)
                a.response_status = norm.response_status
                a.response_updated_at = norm.response_updated_at
                a.response_payload_json = sanitize_negotiation_payload(payload)
                a.last_synced_at = datetime.now(timezone.utc)
                a.sync_error_code = None
                a.sync_error_text = None
                db.add(a)
                db.commit()
                updated += 1
                hh_sync_updated_total.inc()

            reauth_count = db.query(HHAccount).filter(HHAccount.status == "reauth_required").count()
            hh_unauthorized_accounts_total.set(reauth_count)

            hh_sync_runs_total.labels(status="success" if not unauthorized else "failed").inc()

            db.add(
                AuditLog(
                    user_id=user_id,
                    entity_type="hh_account",
                    entity_id=user_id,
                    action="negotiations_sync_finished",
                    metadata_json={
                        "mode": mode,
                        "scanned": scanned,
                        "updated": updated,
                        "errors": errors,
                        "unauthorized": unauthorized,
                        "rate_limited": rate_limited,
                    },
                )
            )
            db.commit()
        except Exception:
            logger.exception("Negotiations sync failed", extra={"request_id": request_id, "user_id": str(user_id)})
            hh_sync_runs_total.labels(status="failed").inc()
            db.add(
                AuditLog(
                    user_id=user_id,
                    entity_type="hh_account",
                    entity_id=user_id,
                    action="negotiations_sync_failed",
                    metadata_json={"mode": mode},
                )
            )
            db.commit()
            raise

    duration_ms = int((time.time() - start) * 1000)
    logger.info(
        "Negotiations sync finished",
        extra={
            "request_id": request_id,
            "user_id": str(user_id),
            "mode": mode,
            "scanned": scanned,
            "updated": updated,
            "errors": errors,
            "duration_ms": duration_ms,
            "unauthorized": unauthorized,
            "rate_limited": rate_limited,
        },
    )
    return SyncStats(
        mode=mode,
        scanned=scanned,
        updated=updated,
        errors=errors,
        unauthorized=unauthorized,
        rate_limited=rate_limited,
        duration_ms=duration_ms,
    )

