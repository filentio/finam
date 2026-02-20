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

