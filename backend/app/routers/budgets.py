from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_user_cfg
from app.models.budget import (
    BudgetBalance, IncomeAllocateRequest, IncomeAllocateResponse,
    BudgetRelocateRequest, BudgetRelocateResponse,
    DirectDepositRequest, DirectDepositResponse,
)
from app.services import budget_service

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetBalance])
def list_budgets(user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    balances = budget_service.get_balances(user_key)
    result = []
    for cat, limit in cfg["limits"].items():
        result.append(BudgetBalance(
            category=cat,
            current_balance=balances.get(cat, 0.0),
            limit=limit,
        ))
    return result


@router.post("/allocate", response_model=IncomeAllocateResponse)
def allocate_income(body: IncomeAllocateRequest, user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    allocations = budget_service.allocate_income(
        user_key,
        body.income_amount,
        cfg["allocation_pct"],
        cfg["limits"],
    )
    return IncomeAllocateResponse(allocations=allocations)


@router.post("/relocate", response_model=BudgetRelocateResponse)
def relocate_budget(body: BudgetRelocateRequest, user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    try:
        result = budget_service.relocate_budget(
            user_key, body.from_category, body.to_category, body.amount
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return BudgetRelocateResponse(
        from_category=body.from_category,
        to_category=body.to_category,
        amount=body.amount,
        from_new_balance=result["from_new_balance"],
        to_new_balance=result["to_new_balance"],
    )


@router.post("/direct", response_model=DirectDepositResponse)
def direct_deposit(body: DirectDepositRequest, user_cfg=Depends(get_user_cfg)):
    cfg, user_key = user_cfg
    try:
        new_balance = budget_service.direct_deposit(user_key, body.category, body.amount)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return DirectDepositResponse(
        category=body.category,
        amount=body.amount,
        new_balance=new_balance,
    )
