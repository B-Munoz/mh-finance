from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import get_user_cfg
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingsPayload(BaseModel):
    allocation_pct: dict[str, float] | None = None
    category_limits: dict[str, float] | None = None


@router.get("")
def get_settings(user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    return settings_service.get_settings(user_key, cfg)


@router.put("")
def save_settings(body: SettingsPayload, user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg

    if body.allocation_pct is not None:
        known = set(cfg["allocation_pct"].keys())
        for cat in body.allocation_pct:
            if cat not in known:
                raise HTTPException(status_code=400, detail=f"Unknown category: {cat}")
        total = sum(body.allocation_pct.values())
        if total > 1.0 + 1e-9:
            raise HTTPException(status_code=400, detail=f"Allocation percentages sum to {total:.2%}, must be ≤ 100%")

    if body.category_limits is not None:
        known = set(cfg["limits"].keys())
        for cat in body.category_limits:
            if cat not in known:
                raise HTTPException(status_code=400, detail=f"Unknown category: {cat}")

    settings_service.save_settings(user_key, body.allocation_pct, body.category_limits)
    return {"ok": True}
