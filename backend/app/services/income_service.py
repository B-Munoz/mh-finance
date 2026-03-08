import json

from sqlalchemy import text

from app.db import get_engine


def init_incomes_db(user_key: str):
    with get_engine(user_key).connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS incomes (
                id SERIAL PRIMARY KEY,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                amount REAL,
                allocations TEXT
            )
        """))
        conn.commit()


def save_income_record(user_key: str, amount: float, allocations_dict: dict) -> dict:
    with get_engine(user_key).connect() as conn:
        with conn.begin():
            result = conn.execute(
                text("""
                    INSERT INTO incomes (amount, allocations)
                    VALUES (:amount, :allocations)
                    RETURNING id, date
                """),
                {"amount": amount, "allocations": json.dumps(allocations_dict)},
            )
            row = result.fetchone()
    return {"id": row[0], "date": row[1]}


def list_incomes(user_key: str) -> list[dict]:
    with get_engine(user_key).connect() as conn:
        result = conn.execute(
            text("SELECT id, date, amount, allocations FROM incomes ORDER BY date DESC")
        )
        rows = result.fetchall()
    return [
        {
            "id": row[0],
            "date": row[1],
            "amount": row[2],
            "allocations": json.loads(row[3]),
        }
        for row in rows
    ]


def delete_income(user_key: str, income_id: int) -> bool:
    with get_engine(user_key).connect() as conn:
        with conn.begin():
            result = conn.execute(
                text("SELECT allocations FROM incomes WHERE id = :id"),
                {"id": income_id},
            )
            row = result.fetchone()
            if row is None:
                return False
            allocations = json.loads(row[0])
            for category, amt in allocations.items():
                conn.execute(
                    text(
                        "UPDATE budgets SET current_balance = current_balance - :amt WHERE category = :cat"
                    ),
                    {"amt": amt, "cat": category},
                )
            conn.execute(
                text("DELETE FROM incomes WHERE id = :id"), {"id": income_id}
            )
    return True
