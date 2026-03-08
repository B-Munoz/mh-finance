from fastapi import Query, HTTPException
from app.config import get_user_config, KNOWN_USERS


def get_user_cfg(user: str = Query(..., description="User key (e.g. neon, pachi)")):
    if user not in KNOWN_USERS:
        raise HTTPException(status_code=404, detail=f"Unknown user '{user}'. Valid users: {KNOWN_USERS}")
    return get_user_config(user), user
