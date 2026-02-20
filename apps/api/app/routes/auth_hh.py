from __future__ import annotations

from fastapi import APIRouter, HTTPException


router = APIRouter(prefix="/auth/hh", tags=["auth_hh"])


@router.get("/status")
def hh_status() -> dict:
    # Stage 3 scaffold: no real HH OAuth integration.
    return {"connected": False, "status": "disconnected", "hh_user_id": None, "scopes": [], "token_expires_at": None}


@router.get("/start")
def hh_start() -> dict:
    raise HTTPException(status_code=501, detail="HH OAuth не реализован на этапе 3 (scaffold).")


@router.get("/callback")
def hh_callback(code: str | None = None, state: str | None = None) -> dict:
    raise HTTPException(status_code=501, detail="HH OAuth callback не реализован на этапе 3 (scaffold).")


@router.post("/disconnect")
def hh_disconnect() -> dict:
    raise HTTPException(status_code=501, detail="HH OAuth disconnect не реализован на этапе 3 (scaffold).")

