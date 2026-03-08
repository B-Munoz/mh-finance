from pydantic import BaseModel


class BudgetBalance(BaseModel):
    category: str
    current_balance: float
    limit: float


class IncomeAllocateRequest(BaseModel):
    income_amount: float


class IncomeAllocateResponse(BaseModel):
    allocations: dict[str, float]
