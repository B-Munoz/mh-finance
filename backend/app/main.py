from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import KNOWN_USERS, get_user_config
from app.services import expense_service, budget_service
from app.routers import expenses, budgets, config

app = FastAPI(title="MH Finance API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses.router, prefix="/api/v1")
app.include_router(budgets.router, prefix="/api/v1")
app.include_router(config.router, prefix="/api/v1")


@app.on_event("startup")
def startup():
    for user_key in KNOWN_USERS:
        cfg = get_user_config(user_key)
        expense_service.init_expenses_db(user_key)
        budget_service.init_budgets_db(user_key, cfg["allocation_pct"], cfg["limits"])


@app.get("/health")
def health():
    return {"status": "ok"}
