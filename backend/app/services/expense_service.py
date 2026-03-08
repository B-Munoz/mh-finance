from collections import defaultdict
from datetime import datetime
from sqlalchemy import text
from app.db import get_engine
from app.models.expense import ExpenseRead


def init_expenses_db(user_key: str):
    with get_engine(user_key).connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                category TEXT,
                description TEXT,
                amount REAL
            )
        """))
        conn.commit()


def load_expenses(user_key: str) -> list[dict]:
    with get_engine(user_key).connect() as conn:
        result = conn.execute(text("SELECT id, date, category, description, amount FROM expenses ORDER BY date DESC"))
        rows = result.fetchall()
        return [
            {"id": r[0], "date": r[1], "category": r[2], "description": r[3], "amount": r[4]}
            for r in rows
        ]


def add_expense(user_key: str, category: str, description: str, amount: float) -> dict:
    with get_engine(user_key).connect() as conn:
        with conn.begin():
            result = conn.execute(
                text("INSERT INTO expenses (date, category, description, amount) VALUES (:d, :c, :desc, :a) RETURNING id, date"),
                {"d": datetime.now(), "c": category, "desc": description, "a": amount}
            )
            row = result.fetchone()
            conn.execute(
                text("UPDATE budgets SET current_balance = current_balance - :a WHERE category = :c"),
                {"a": amount, "c": category}
            )
    return {"id": row[0], "date": row[1], "category": category, "description": description, "amount": amount}


def delete_expense(user_key: str, expense_id: int):
    with get_engine(user_key).connect() as conn:
        with conn.begin():
            result = conn.execute(
                text("SELECT category, amount FROM expenses WHERE id = :id"),
                {"id": expense_id}
            )
            row = result.fetchone()
            if row is None:
                return False
            category, amount = row[0], row[1]
            conn.execute(text("DELETE FROM expenses WHERE id = :id"), {"id": expense_id})
            conn.execute(
                text("UPDATE budgets SET current_balance = current_balance + :a WHERE category = :c"),
                {"a": amount, "c": category}
            )
    return True


def save_bulk_data(user_key: str, expenses: list[dict]):
    with get_engine(user_key).connect() as conn:
        with conn.begin():
            # 1. Calculate net change per category
            old_result = conn.execute(text("SELECT category, amount FROM expenses"))
            old_rows = old_result.fetchall()

            old_totals: dict[str, float] = defaultdict(float)
            for row in old_rows:
                old_totals[row[0]] += row[1]

            new_totals: dict[str, float] = defaultdict(float)
            for exp in expenses:
                new_totals[exp["category"]] += exp["amount"]

            all_cats = set(old_totals) | set(new_totals)
            diffs = {cat: new_totals.get(cat, 0.0) - old_totals.get(cat, 0.0) for cat in all_cats}

            # 2. Sync expenses table
            conn.execute(text("DELETE FROM expenses"))
            for exp in expenses:
                conn.execute(
                    text("INSERT INTO expenses (id, date, category, description, amount) VALUES (:id, :date, :cat, :desc, :amt)"),
                    {"id": exp.get("id"), "date": exp["date"], "cat": exp["category"], "desc": exp["description"], "amt": exp["amount"]}
                )

            # 3. Adjust budgets (expense up = balance down)
            for cat, diff in diffs.items():
                if diff != 0:
                    conn.execute(
                        text("UPDATE budgets SET current_balance = current_balance - :d WHERE category = :c"),
                        {"d": float(diff), "c": cat}
                    )
