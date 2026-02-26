from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlencode

import httpx

from app.settings import Settings


class HHOAuthClientError(RuntimeError):
    """Base error for HH OAuth client."""


class HHOAuthNetworkError(HHOAuthClientError):
    """Network/timeout error."""


class HHOAuthTokenExchangeFailed(HHOAuthClientError):
    """HH returned non-2xx or invalid token payload."""


@dataclass(frozen=True)
class TokenResponse:
    access_token: str
    refresh_token: str | None
    expires_at: datetime | None
    scopes: list[str] | None


class HHOAuthClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def build_authorize_url(self, state: str, force_login: bool = False) -> str:
        redirect_uri = self.settings.get_hh_redirect_uri()
        if not self.settings.HH_CLIENT_ID:
            raise HHOAuthClientError("HH_CLIENT_ID is not configured.")

        params: dict[str, Any] = {
            "response_type": "code",
            "client_id": self.settings.HH_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "state": state,
        }
        # HH docs: to always show login form use force_login=true
        if force_login:
            params["force_login"] = "true"

        return f"{self.settings.HH_OAUTH_AUTHORIZE_URL}?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> TokenResponse:
        redirect_uri = self.settings.get_hh_redirect_uri()
        if not self.settings.HH_CLIENT_ID or not self.settings.HH_CLIENT_SECRET:
            raise HHOAuthClientError("HH_CLIENT_ID/HH_CLIENT_SECRET are not configured.")

        data = {
            "grant_type": "authorization_code",
            "client_id": self.settings.HH_CLIENT_ID,
            "client_secret": self.settings.HH_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "code": code,
        }

        timeout = httpx.Timeout(10.0, connect=5.0)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(self.settings.HH_OAUTH_TOKEN_URL, data=data)
        except httpx.RequestError as e:
            raise HHOAuthNetworkError("Network error while exchanging code for token.") from e

        if resp.status_code >= 400:
            raise HHOAuthTokenExchangeFailed("HH token exchange failed.")

        payload = resp.json()
        access_token = payload.get("access_token")
        if not access_token:
            raise HHOAuthTokenExchangeFailed("HH token response has no access_token.")

        refresh_token = payload.get("refresh_token")
        expires_in = payload.get("expires_in")
        expires_at = None
        if isinstance(expires_in, (int, float)) and expires_in > 0:
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=int(expires_in))

        scope = payload.get("scope")
        scopes = None
        if isinstance(scope, str) and scope.strip():
            scopes = scope.split()

        return TokenResponse(
            access_token=str(access_token),
            refresh_token=str(refresh_token) if refresh_token else None,
            expires_at=expires_at,
            scopes=scopes,
        )

