from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.services.hh_normalizer import parse_hh_datetime


@dataclass(frozen=True)
class NormalizedNegotiationStatus:
    response_status: str  # pending|viewed|invited|rejected|closed|unknown
    flags: list[str]
    response_updated_at: Any  # datetime|None (kept Any to avoid importing datetime in typing)


def sanitize_negotiation_payload(raw: dict[str, Any]) -> dict[str, Any]:
    """
    Keep only minimal fields; exclude resume PII.
    """
    state = raw.get("state") or {}
    state_id = state.get("id") if isinstance(state, dict) else None
    state_name = state.get("name") if isinstance(state, dict) else None

    vacancy = raw.get("vacancy") or {}
    vacancy_id = vacancy.get("id") if isinstance(vacancy, dict) else None
    vacancy_name = vacancy.get("name") if isinstance(vacancy, dict) else None

    counters = raw.get("counters") or {}
    messages = counters.get("messages") if isinstance(counters, dict) else None
    unread = counters.get("unread_messages") if isinstance(counters, dict) else None

    return {
        "id": raw.get("id"),
        "state": {"id": state_id, "name": state_name},
        "updated_at": raw.get("updated_at"),
        "created_at": raw.get("created_at"),
        "viewed_by_opponent": raw.get("viewed_by_opponent"),
        "has_updates": raw.get("has_updates"),
        "messaging_status": raw.get("messaging_status"),
        "vacancy": {"id": vacancy_id, "name": vacancy_name},
        "counters": {"messages": messages, "unread_messages": unread},
    }


def normalize_negotiation_status(raw: dict[str, Any]) -> NormalizedNegotiationStatus:
    """
    Best-effort mapping for applicant negotiation state -> response_status.
    We use:
      - state.id (string)
      - viewed_by_opponent (bool)
      - has_updates (bool)
    """
    flags: list[str] = []
    state = raw.get("state") or {}
    state_id = None
    if isinstance(state, dict):
        state_id = state.get("id")
    elif isinstance(state, str):
        state_id = state
    state_id = str(state_id) if state_id else None

    viewed = bool(raw.get("viewed_by_opponent"))
    if viewed:
        flags.append("VIEWED_BY_EMPLOYER")
    if bool(raw.get("has_updates")):
        flags.append("HAS_UPDATES")

    updated_at = parse_hh_datetime(raw.get("updated_at"))

    # Mapping table
    invited_states = {"phone_interview", "interview", "assessment", "offer"}
    rejected_states = {"discard", "discard_by_employer", "rejected", "rejected_by_employer"}
    closed_states = {"hired", "closed"}
    pending_states = {"response", "consider", "active"}

    if state_id in invited_states:
        status = "invited"
    elif state_id in rejected_states:
        status = "rejected"
    elif state_id in closed_states:
        status = "closed"
    elif state_id in pending_states:
        status = "viewed" if viewed else "pending"
    else:
        status = "unknown"
        if state_id:
            flags.append(f"STATE:{state_id}")

    return NormalizedNegotiationStatus(response_status=status, flags=flags, response_updated_at=updated_at)

