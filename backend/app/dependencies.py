from fastapi import Depends
from fastapi.security import HTTPBearer

from app.auth import decode_token
from app.config import get_user_config
from app.services import settings_service

bearer = HTTPBearer()


def get_current_user(credentials=Depends(bearer)):
    username = decode_token(credentials.credentials)
    cfg = get_user_config(username)
    cfg = settings_service.get_effective_config(username, cfg)
    return cfg, username


# Alias — all existing routers use get_user_cfg unchanged
get_user_cfg = get_current_user
