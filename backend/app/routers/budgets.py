from fastapi import APIRouter, Depends
from app.dependencies import get_user_cfg
from app.models.budget import BudgetBalance, IncomeAllocateRequest, IncomeAllocateResponse
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
