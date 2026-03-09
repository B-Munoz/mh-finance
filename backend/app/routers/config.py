from fastapi import APIRouter, Depends
from app.dependencies import get_user_cfg
from app.services import settings_service

router = APIRouter(prefix="/config", tags=["config"])


@router.get("")
def get_config(user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    cfg = settings_service.get_effective_config(user_key, cfg)
    return cfg
