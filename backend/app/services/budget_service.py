from sqlalchemy import text
from app.db import get_engine
from app.services import income_service


def init_budgets_db(user_key: str, allocation_map: dict, limit_map: dict):
    with get_engine(user_key).connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS budgets (
                category TEXT PRIMARY KEY,
                current_balance REAL DEFAULT 0
            )
        """))
        conn.commit()

        config_categories = list(allocation_map.keys())
        with conn.begin():
            for cat in config_categories:
                conn.execute(
                    text("INSERT INTO budgets (category, current_balance) VALUES (:cat, 0) ON CONFLICT (category) DO NOTHING"),
                    {"cat": cat}
                )
            conn.execute(
                text("DELETE FROM budgets WHERE category NOT IN :cats"),
                {"cats": tuple(config_categories)}
            )


def get_balances(user_key: str) -> dict[str, float]:
    with get_engine(user_key).connect() as conn:
        result = conn.execute(text("SELECT category, current_balance FROM budgets"))
        rows = result.fetchall()
        return {row[0]: row[1] for row in rows}


def allocate_income(user_key: str, income_amount: float, allocation_map: dict, limit_map: dict) -> dict[str, float]:
    current_balances = get_balances(user_key)
    allocations = {cat: 0.0 for cat in allocation_map}
    remaining_income = float(income_amount)

    # --- Waterfall Logic (verbatim from original) ---
    while remaining_income > 0.01:
        active_cats = []
        for cat, pct in allocation_map.items():
            if pct <= 0:
                continue
            limit = limit_map.get(cat, 0)
            current = current_balances.get(cat, 0.0) + allocations[cat]
            if limit == 0 or current < limit:
                active_cats.append(cat)

        if not active_cats:
            break

        total_active_weight = sum(allocation_map[c] for c in active_cats)
        if total_active_weight == 0:
            break

        distributed_this_round = 0
        for cat in active_cats:
            weight = allocation_map[cat] / total_active_weight
            share = remaining_income * weight
            limit = limit_map.get(cat, 0)
            current = current_balances.get(cat, 0.0) + allocations[cat]
            space = (limit - current) if limit > 0 else float("inf")
            actual_add = min(share, space)
            allocations[cat] += actual_add
            distributed_this_round += actual_add

        remaining_income -= distributed_this_round
        if distributed_this_round < 0.01:
            break

    with get_engine(user_key).connect() as conn:
        with conn.begin():
            for cat, amount in allocations.items():
                if amount > 0:
                    conn.execute(
                        text("UPDATE budgets SET current_balance = current_balance + :amt WHERE category = :cat"),
                        {"amt": amount, "cat": cat}
                    )

    income_service.save_income_record(user_key, income_amount, allocations)

    return allocations
