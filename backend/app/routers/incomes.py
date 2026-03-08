from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_user_cfg
from app.models.income import IncomeRecord
from app.services import income_service

router = APIRouter(tags=["incomes"])


@router.get("/incomes", response_model=list[IncomeRecord])
def list_incomes(user=Depends(get_user_cfg)):
    _, user_key = user
    return income_service.list_incomes(user_key)


@router.delete("/incomes/{income_id}", status_code=204)
def delete_income(income_id: int, user=Depends(get_user_cfg)):
    _, user_key = user
    found = income_service.delete_income(user_key, income_id)
    if not found:
        raise HTTPException(status_code=404, detail="Income record not found")
