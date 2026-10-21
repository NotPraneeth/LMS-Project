"""Password hashing, JWT issuing, and session cookie helpers.

JWT is delivered in an HttpOnly, SameSite=Lax cookie (`lms_session`). The raw
token's SHA-256 hash is persisted in `user_sessions` so sessions can be listed
and revoked server-side (refresh-token rotation is deferred but supported by
the schema).
"""

import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings

COOKIE_NAME = "lms_session"


# --- passwords ------------------------------------------------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


# --- JWT -------------------------------------------------------------------

def create_access_token(claims: dict) -> str:
    """claims must include sub (user id), email, and name."""
    payload = {
        **claims,
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": int(
            (datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_ttl_minutes)).timestamp()
        ),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def token_sha256(token: str) -> str:
    """Server-side hash stored in user_sessions.token_hash."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


# --- cookie ----------------------------------------------------------------

def session_cookie(max_age_seconds: int | None = None) -> dict:
    """Cookie params for Set-Cookie (HttpOnly; SameSite=Lax; not Secure in dev)."""
    params: dict = {
        "key": COOKIE_NAME,
        "httponly": True,
        "samesite": "lax",
        "secure": False,  # dev is plain http; set True behind TLS
        "path": "/",
    }
    if max_age_seconds is not None:
        params["max_age"] = max_age_seconds
    return params
