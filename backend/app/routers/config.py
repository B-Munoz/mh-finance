from fastapi import APIRouter, Depends
from app.dependencies import get_user_cfg

router = APIRouter(prefix="/config", tags=["config"])


@router.get("")
def get_config(user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    return cfg
