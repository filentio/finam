from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy.orm import Session, sessionmaker

from app.models.application import Application
from app.models.audit_log import AuditLog
from app.models.cover_letter import CoverLetter
from app.models.hh_account import HHAccount
from app.models.vacancy import Vacancy
from app.services.hh_api_client import HHApiApplyFailed, HHApiClient, HHApiUnavailable
from app.settings import Settings

logger = logging.getLogger(__name__)


def _day_key(user_id: str, dt: datetime) -> str:
    return f"hh:apply:day:{user_id}:{dt.strftime('%Y%m%d')}"


def _hour_key(user_id: str, dt: datetime) -> str:
    return f"hh:apply:hour:{user_id}:{dt.strftime('%Y%m%d%H')}"


def _incr_with_ttl(redis, key: str, ttl_seconds: int) -> int:
    n = int(redis.incr(key))
    if n == 1:
        redis.expire(key, ttl_seconds)
    return n


@dataclass(frozen=True)
class ApplyOrchestrator:
    settings: Settings
    hh: HHApiClient

    async def process_send(self, *, db: Session, application_id) -> Application:
        now = datetime.now(timezone.utc)

        a = db.get(Application, application_id)
        if a is None:
            raise ValueError("Application not found.")

        # Idempotent stop conditions
        if a.status in {"sent", "failed"}:
            return a
        if a.status != "queued":
            # only queued is processed by worker
            return a

        vacancy = db.get(Vacancy, a.vacancy_id)
        if vacancy is None:
            return self._fail(db, a, "VACANCY_NOT_FOUND", "Вакансия не найдена.")

        if not vacancy.apply_via_hh:
            return self._fail(db, a, "HH_DIRECT_VACANCY", "Отклик через HH API невозможен для этой вакансии.")

        acc = db.query(HHAccount).filter(HHAccount.user_id == a.user_id).one_or_none()
        if acc is None or acc.status != "active" or not acc.access_token_ciphertext:
            return self._fail(db, a, "HH_NOT_CONNECTED", "HH OAuth не подключен или требуется повторная авторизация.")

        if not a.cover_letter_id:
            return self._fail(db, a, "COVER_LETTER_REQUIRED", "Нужен черновик письма для отправки отклика.")

        cl = db.get(CoverLetter, a.cover_letter_id)
        if cl is None or cl.user_id != a.user_id:
            return self._fail(db, a, "COVER_LETTER_REQUIRED", "Черновик письма не найден.")

        is_valid = bool((cl.validation_json or {}).get("is_valid"))
        if not is_valid:
            return self._fail(db, a, "COVER_LETTER_INVALID", "Черновик письма не прошёл валидацию.")

        # Local rate limits
        redis = db.info.get("redis")
        if redis is not None:
            day_count = _incr_with_ttl(redis, _day_key(str(a.user_id), now), ttl_seconds=60 * 60 * 26)
            hour_count = _incr_with_ttl(redis, _hour_key(str(a.user_id), now), ttl_seconds=60 * 60 * 2)
            if day_count > self.settings.HH_APPLY_DAILY_LIMIT or hour_count > self.settings.HH_APPLY_HOURLY_LIMIT:
                return self._fail(db, a, "RATE_LIMIT_LOCAL", "Превышен локальный лимит отправки откликов.")

        # Attempt
        a.last_attempt_at = now
        a.attempt_count = (a.attempt_count or 0) + 1
        db.add(a)
        db.commit()

        try:
            result = await self.hh.apply_to_vacancy(
                vacancy_id=vacancy.external_vacancy_id,
                resume_id=a.resume_id,
                message=cl.text,
                access_token=acc.access_token_ciphertext,
            )
        except HHApiApplyFailed as e:
            if e.status_code == 401:
                # require re-auth
                acc.status = "reauth_required"
                db.add(acc)
                db.commit()
                return self._fail(db, a, "HH_UNAUTHORIZED", "HH отклонил запрос: требуется повторная авторизация.")
            if e.status_code == 403:
                return self._fail(db, a, "HH_FORBIDDEN", "HH запретил отправку отклика (403).")
            if e.status_code == 429:
                return self._fail(db, a, "HH_RATE_LIMITED", "HH ограничил частоту запросов (429).")
            return self._fail(db, a, "HH_APPLY_FAILED", "HH не принял отклик.")
        except HHApiUnavailable:
            return self._fail(db, a, "HH_UNAVAILABLE", "HH временно недоступен.")

        # Success
        a.status = "sent"
        a.sent_at = datetime.now(timezone.utc)
        a.external_application_id = result.get("negotiation_id")
        a.error_code = None
        a.error_message = None
        db.add(a)
        db.add(
            AuditLog(
                user_id=a.user_id,
                entity_type="application",
                entity_id=a.id,
                action="application_sent",
                metadata_json={"negotiation_id": a.external_application_id},
            )
        )
        db.commit()
        db.refresh(a)
        return a

    def _fail(self, db: Session, a: Application, code: str, message: str) -> Application:
        a.status = "failed"
        a.failed_at = datetime.now(timezone.utc)
        a.error_code = code
        a.error_message = message
        db.add(a)
        db.add(
            AuditLog(
                user_id=a.user_id,
                entity_type="application",
                entity_id=a.id,
                action="application_failed",
                metadata_json={"error_code": code},
            )
        )
        db.commit()
        db.refresh(a)
        return a


async def process_send_job(
    *,
    session_local: sessionmaker,
    redis,
    settings: Settings,
    application_id,
    request_id: str | None = None,
) -> None:
    db = session_local()
    try:
        db.info["redis"] = redis
        orch = ApplyOrchestrator(settings=settings, hh=HHApiClient(max_retries=settings.HH_APPLY_MAX_RETRIES))
        await orch.process_send(db=db, application_id=application_id)
    except Exception:
        logger.exception("Apply send job failed", extra={"request_id": request_id, "application_id": str(application_id)})
        db.rollback()
    finally:
        db.close()

