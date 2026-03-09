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


def get_effective_config(user_key: str, toml_cfg: dict) -> dict:
    """Merge DB-stored settings over TOML defaults. Returns same shape as get_user_config."""
    import copy
    cfg = copy.deepcopy(toml_cfg)
    try:
        with get_engine(user_key).connect() as conn:
            result = conn.execute(text("SELECT key, value FROM user_settings"))
            rows = {row[0]: row[1] for row in result.fetchall()}
        if "allocation_pct" in rows:
            cfg["allocation_pct"] = json.loads(rows["allocation_pct"])
        if "category_limits" in rows:
            cfg["limits"] = json.loads(rows["category_limits"])
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
