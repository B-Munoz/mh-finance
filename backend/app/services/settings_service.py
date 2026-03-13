import json

from sqlalchemy import text

from app.db import get_engine


def init_settings_db(user_key: str):
    with get_engine(user_key).connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """))
        conn.commit()


def _get_db_rows(user_key: str) -> dict:
    try:
        with get_engine(user_key).connect() as conn:
            result = conn.execute(text("SELECT key, value FROM user_settings"))
            return {row[0]: row[1] for row in result.fetchall()}
    except Exception:
        return {}


def _save_category_state(user_key: str, category_names: list, allocation_pct: dict, category_limits: dict):
    with get_engine(user_key).connect() as conn:
        with conn.begin():
            for key, val in [
                ("category_names", json.dumps(category_names)),
                ("allocation_pct", json.dumps(allocation_pct)),
                ("category_limits", json.dumps(category_limits)),
            ]:
                conn.execute(
                    text("INSERT INTO user_settings (key, value) VALUES (:k, :v) ON CONFLICT (key) DO UPDATE SET value = :v"),
                    {"k": key, "v": val},
                )


def get_effective_config(user_key: str, toml_cfg: dict) -> dict:
    """Merge DB-stored settings over TOML defaults. Returns same shape as get_user_config."""
    import copy
    cfg = copy.deepcopy(toml_cfg)
    try:
        rows = _get_db_rows(user_key)
        if "allocation_pct" in rows:
            cfg["allocation_pct"] = json.loads(rows["allocation_pct"])
        if "category_limits" in rows:
            cfg["limits"] = json.loads(rows["category_limits"])
        if "category_names" in rows:
            names = json.loads(rows["category_names"])
            cfg["categories"] = names
            cfg["allocation_pct"] = {n: cfg["allocation_pct"].get(n, 0.0) for n in names}
            cfg["limits"] = {n: cfg["limits"].get(n, 0) for n in names}
    except Exception:
        pass
    return cfg


def save_settings(user_key: str, allocation_pct: dict | None, category_limits: dict | None):
    with get_engine(user_key).connect() as conn:
        with conn.begin():
            if allocation_pct is not None:
                conn.execute(
                    text("INSERT INTO user_settings (key, value) VALUES ('allocation_pct', :v) ON CONFLICT (key) DO UPDATE SET value = :v"),
                    {"v": json.dumps(allocation_pct)},
                )
            if category_limits is not None:
                conn.execute(
                    text("INSERT INTO user_settings (key, value) VALUES ('category_limits', :v) ON CONFLICT (key) DO UPDATE SET value = :v"),
                    {"v": json.dumps(category_limits)},
                )


def get_settings(user_key: str, toml_cfg: dict) -> dict:
    cfg = get_effective_config(user_key, toml_cfg)
    return {
        "allocation_pct": cfg["allocation_pct"],
        "category_limits": cfg["limits"],
    }


def add_category(user_key: str, name: str, toml_cfg: dict):
    effective = get_effective_config(user_key, toml_cfg)
    if name in effective["categories"]:
        raise ValueError(f"Category '{name}' already exists")

    with get_engine(user_key).connect() as conn:
        with conn.begin():
            conn.execute(
                text("INSERT INTO budgets (category, current_balance) VALUES (:cat, 0) ON CONFLICT (category) DO NOTHING"),
                {"cat": name},
            )

    names = effective["categories"] + [name]
    alloc_pct = {**effective["allocation_pct"], name: 0.0}
    limits = {**effective["limits"], name: 0}
    _save_category_state(user_key, names, alloc_pct, limits)


def delete_category(user_key: str, name: str, toml_cfg: dict):
    with get_engine(user_key).connect() as conn:
        result = conn.execute(
            text("SELECT current_balance FROM budgets WHERE category = :cat"),
            {"cat": name},
        )
        row = result.fetchone()
        if row is None:
            raise ValueError(f"Category '{name}' not found")
        if row[0] > 0:
            raise ValueError(
                f"Category '{name}' has a remaining balance of {row[0]:.0f}. Transfer it out before deleting."
            )

    effective = get_effective_config(user_key, toml_cfg)

    with get_engine(user_key).connect() as conn:
        with conn.begin():
            conn.execute(text("DELETE FROM budgets WHERE category = :cat"), {"cat": name})

    names = [n for n in effective["categories"] if n != name]
    alloc_pct = {k: v for k, v in effective["allocation_pct"].items() if k != name}
    limits = {k: v for k, v in effective["limits"].items() if k != name}
    _save_category_state(user_key, names, alloc_pct, limits)


def rename_category(user_key: str, old_name: str, new_name: str, toml_cfg: dict):
    effective = get_effective_config(user_key, toml_cfg)
    if old_name not in effective["categories"]:
        raise ValueError(f"Category '{old_name}' not found")
    if new_name in effective["categories"]:
        raise ValueError(f"Category '{new_name}' already exists")

    with get_engine(user_key).connect() as conn:
        with conn.begin():
            conn.execute(
                text("UPDATE budgets SET category = :new WHERE category = :old"),
                {"new": new_name, "old": old_name},
            )

    names = [new_name if n == old_name else n for n in effective["categories"]]
    alloc_pct = {(new_name if k == old_name else k): v for k, v in effective["allocation_pct"].items()}
    limits = {(new_name if k == old_name else k): v for k, v in effective["limits"].items()}
    _save_category_state(user_key, names, alloc_pct, limits)
