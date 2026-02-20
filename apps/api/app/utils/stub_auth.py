from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.models.user import User


DEFAULT_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def get_or_create_stub_user(db: Session) -> User:
    user = db.get(User, DEFAULT_USER_ID)
    if user is not None:
        return user
    user = User(id=DEFAULT_USER_ID, role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

