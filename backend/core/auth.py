"""
Auth for CARIA-GAP: FastAPI as a resource server (Roadmap Phase 2).

NextAuth (on the Next.js side) owns login and issues a signed JWT. FastAPI never
sees passwords; it only validates that JWT here and reads its claims. Validation
uses the same shared secret NextAuth signs with (AUTH_SECRET, HS256).

Dependencies:
  get_optional_user  -> identity if a valid token is present, else None (guest-OK
                        endpoints; the existing assessment flow stays open).
  get_current_user   -> 401 if no/invalid token.
  require_role(...)   -> 403 unless the token's role is allowed (e.g. admin).

`create_access_token` is a dev/credentials helper (used by /auth/verify-student
and tests) so the backend can mint a token without the Next side present yet.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

ALGORITHM = "HS256"
_bearer = HTTPBearer(auto_error=False)


def _secret() -> str:
    secret = os.getenv("AUTH_SECRET")
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AUTH_SECRET is not configured on the server",
        )
    return secret


class AuthUser(BaseModel):
    sub: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str = "guest"
    student_id: Optional[str] = None
    program: Optional[str] = None
    provider: Optional[str] = None


def create_access_token(claims: dict, expires_minutes: int = 60 * 24 * 7) -> str:
    to_encode = dict(claims)
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    return jwt.encode(to_encode, _secret(), algorithm=ALGORITHM)


def _decode(token: str) -> dict:
    try:
        return jwt.decode(token, _secret(), algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {exc}")


def get_optional_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> Optional[AuthUser]:
    if creds is None:
        return None
    payload = _decode(creds.credentials)
    return AuthUser(
        sub=str(payload.get("sub", "")),
        email=payload.get("email"),
        name=payload.get("name"),
        role=payload.get("role", "guest"),
        # accept both snake_case and NextAuth-style camelCase claims
        student_id=payload.get("student_id") or payload.get("studentId"),
        program=payload.get("program"),
        provider=payload.get("provider"),
    )


def get_current_user(user: Optional[AuthUser] = Depends(get_optional_user)) -> AuthUser:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def require_role(*roles: str):
    def checker(user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {', '.join(roles)}",
            )
        return user

    return checker
