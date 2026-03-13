from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import get_user_cfg
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingsPayload(BaseModel):
    allocation_pct: dict[str, float] | None = None
    category_limits: dict[str, float] | None = None


class CategoryPayload(BaseModel):
    name: str


class RenameCategoryPayload(BaseModel):
    new_name: str


@router.get("")
def get_settings(user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    return settings_service.get_settings(user_key, cfg)


@router.put("")
def save_settings(body: SettingsPayload, user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    effective = settings_service.get_effective_config(user_key, cfg)

    if body.allocation_pct is not None:
        known = set(effective["allocation_pct"].keys())
        for cat in body.allocation_pct:
            if cat not in known:
                raise HTTPException(status_code=400, detail=f"Unknown category: {cat}")
        total = sum(body.allocation_pct.values())
        if total > 1.0 + 1e-9:
            raise HTTPException(status_code=400, detail=f"Allocation percentages sum to {total:.2%}, must be ≤ 100%")

    if body.category_limits is not None:
        known = set(effective["limits"].keys())
        for cat in body.category_limits:
            if cat not in known:
                raise HTTPException(status_code=400, detail=f"Unknown category: {cat}")

    settings_service.save_settings(user_key, body.allocation_pct, body.category_limits)
    return {"ok": True}


@router.post("/categories", status_code=201)
def add_category(body: CategoryPayload, user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    try:
        settings_service.add_category(user_key, body.name.strip(), cfg)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return {"ok": True}


@router.delete("/categories/{name}")
def delete_category(name: str, user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    try:
        settings_service.delete_category(user_key, name, cfg)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return {"ok": True}


@router.put("/categories/{name}")
def rename_category(name: str, body: RenameCategoryPayload, user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    try:
        settings_service.rename_category(user_key, name, body.new_name.strip(), cfg)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return {"ok": True}
