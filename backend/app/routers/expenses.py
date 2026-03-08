from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_user_cfg
from app.models.expense import ExpenseCreate, ExpenseRead, ExpenseBulkUpdateRequest
from app.services import expense_service

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=list[ExpenseRead])
def list_expenses(user_cfg=Depends(get_user_cfg)):
    _, user_key = user_cfg
    return expense_service.load_expenses(user_key)


@router.post("", response_model=ExpenseRead, status_code=201)
def create_expense(body: ExpenseCreate, user_cfg=Depends(get_user_cfg)):
    _, user_key = user_cfg
    return expense_service.add_expense(user_key, body.category, body.description, body.amount)


@router.put("/bulk", status_code=204)
def bulk_update(body: ExpenseBulkUpdateRequest, user_cfg=Depends(get_user_cfg)):
    _, user_key = user_cfg
    expenses = [e.model_dump() for e in body.expenses]
    expense_service.save_bulk_data(user_key, expenses)


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, user_cfg=Depends(get_user_cfg)):
    _, user_key = user_cfg
    found = expense_service.delete_expense(user_key, expense_id)
    if not found:
        raise HTTPException(status_code=404, detail="Expense not found")
