import os
import tomli
from pathlib import Path

_SETTINGS_PATH = Path(__file__).parent.parent / "config" / "settings.toml"

with open(_SETTINGS_PATH, "rb") as f:
    _raw = tomli.load(f)

# DB URLs: env vars take precedence (required for Railway; fallback to users.toml for local dev)
def _load_connections() -> dict[str, str]:
    env_neon = os.environ.get("MH_NEON_DB_URL")
    env_pachi = os.environ.get("MH_PACHI_DB_URL")
    if env_neon and env_pachi:
        return {
            "neon": env_neon.replace("postgres://", "postgresql://"),
            "pachi": env_pachi.replace("postgres://", "postgresql://"),
        }
    # Fallback: load from users.toml (local dev)
    _secrets_path = Path(__file__).parent.parent / "config" / "users.toml"
    with open(_secrets_path, "rb") as f:
        _secrets = tomli.load(f)
    return {
        key: val["url"].replace("postgres://", "postgresql://")
        for key, val in _secrets["connections"].items()
    }

CONNECTIONS: dict[str, str] = _load_connections()

USER_SETTINGS: dict[str, dict] = _raw.get("user_settings", {})

KNOWN_USERS = list(USER_SETTINGS.keys())

# Passwords: env vars take precedence over settings.toml
_toml_credentials: dict[str, str] = _raw.get("credentials", {})
CREDENTIALS: dict[str, str] = {
    "neon": os.environ.get("MH_NEON_PASSWORD") or _toml_credentials.get("neon", ""),
    "pachi": os.environ.get("MH_PACHI_PASSWORD") or _toml_credentials.get("pachi", ""),
}


def get_user_config(user_key: str) -> dict:
    settings = USER_SETTINGS.get(user_key)
    if settings is None:
        raise KeyError(f"User '{user_key}' not found in config")
    return {
        "categories": list(settings["CATEGORY_CONFIG"].keys()),
        "limits": dict(settings["CATEGORY_CONFIG"]),
        "allocation_pct": dict(settings["ALLOCATION_PCT"]),
    }
