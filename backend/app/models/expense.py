from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExpenseCreate(BaseModel):
    category: str
    description: str
    amount: float


class ExpenseRead(BaseModel):
    id: int
    date: datetime
    category: str
    description: str
    amount: float

    class Config:
        from_attributes = True


class ExpenseBulkUpdateRequest(BaseModel):
    expenses: list[ExpenseRead]
