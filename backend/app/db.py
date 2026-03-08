from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from app.config import CONNECTIONS

_engines: dict[str, Engine] = {}


def get_engine(user_key: str) -> Engine:
    if user_key not in _engines:
        url = CONNECTIONS[user_key]
        _engines[user_key] = create_engine(url)
    return _engines[user_key]
