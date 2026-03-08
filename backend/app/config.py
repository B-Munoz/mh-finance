import os
import tomli
from pathlib import Path

_CONFIG_PATH = Path(__file__).parent.parent / "config" / "users.toml"

with open(_CONFIG_PATH, "rb") as f:
    _raw = tomli.load(f)

CONNECTIONS: dict[str, str] = {
    key: val["url"].replace("postgres://", "postgresql://")
    for key, val in _raw["connections"].items()
}

USER_SETTINGS: dict[str, dict] = _raw.get("user_settings", {})

KNOWN_USERS = list(CONNECTIONS.keys())

# Passwords: env vars take precedence over TOML (for Railway deployment)
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
