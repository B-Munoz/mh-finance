from datetime import datetime
from pydantic import BaseModel


class IncomeRecord(BaseModel):
    id: int
    date: datetime
    amount: float
    allocations: dict[str, float]
