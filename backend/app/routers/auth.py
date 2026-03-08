from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.auth import create_access_token, verify_password
from app.config import CREDENTIALS, KNOWN_USERS

router = APIRouter(tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
def login(body: LoginRequest):
    if body.username not in KNOWN_USERS:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    stored_hash = CREDENTIALS.get(body.username, "")
    if not stored_hash or not verify_password(body.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(body.username)
    return {"access_token": token, "token_type": "bearer"}
