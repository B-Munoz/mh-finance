from pydantic import BaseModel


class BudgetBalance(BaseModel):
    category: str
    current_balance: float
    limit: float


class IncomeAllocateRequest(BaseModel):
    income_amount: float


class IncomeAllocateResponse(BaseModel):
    allocations: dict[str, float]


class BudgetRelocateRequest(BaseModel):
    from_category: str
    to_category: str
    amount: float


class BudgetRelocateResponse(BaseModel):
    from_category: str
    to_category: str
    amount: float
    from_new_balance: float
    to_new_balance: float


class DirectDepositRequest(BaseModel):
    category: str
    amount: float


class DirectDepositResponse(BaseModel):
    category: str
    amount: float
    new_balance: float
