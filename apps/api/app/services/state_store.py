from __future__ import annotations

import time
from dataclasses import dataclass


class StateStore:
    def setex(self, key: str, ttl_seconds: int, value: str) -> None:  # pragma: no cover
        raise NotImplementedError

    def get(self, key: str) -> str | None:  # pragma: no cover
        raise NotImplementedError

    def delete(self, key: str) -> int:  # pragma: no cover
        raise NotImplementedError

    # Optional Redis-like helpers (used for local rate limits)
    def incr(self, key: str) -> int:  # pragma: no cover
        raise NotImplementedError

    def expire(self, key: str, ttl_seconds: int) -> bool:  # pragma: no cover
        raise NotImplementedError


@dataclass
class InMemoryStateStore(StateStore):
    _data: dict[str, tuple[str, float | None]]

    def __init__(self) -> None:
        self._data = {}

    def setex(self, key: str, ttl_seconds: int, value: str) -> None:
        expires_at = time.time() + ttl_seconds if ttl_seconds > 0 else None
        self._data[key] = (value, expires_at)

    def get(self, key: str) -> str | None:
        item = self._data.get(key)
        if not item:
            return None
        value, expires_at = item
        if expires_at is not None and time.time() > expires_at:
            self._data.pop(key, None)
            return None
        return value

    def delete(self, key: str) -> int:
        existed = 1 if key in self._data else 0
        self._data.pop(key, None)
        return existed

    def incr(self, key: str) -> int:
        current = self.get(key)
        try:
            n = int(current) if current is not None else 0
        except ValueError:
            n = 0
        n += 1
        # keep existing expiry if present
        expires_at = self._data.get(key, (None, None))[1]
        self._data[key] = (str(n), expires_at)
        return n

    def expire(self, key: str, ttl_seconds: int) -> bool:
        if key not in self._data:
            return False
        value, _ = self._data[key]
        expires_at = time.time() + ttl_seconds if ttl_seconds > 0 else None
        self._data[key] = (value, expires_at)
        return True

