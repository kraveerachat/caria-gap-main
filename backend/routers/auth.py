"""Auth endpoints (Roadmap Phase 2).

  GET  /api/v1/auth/me              -> current identity; upserts the User row on
                                      first authenticated call (identity is born on
                                      the Next side, persisted by the one ORM owner).
  POST /api/v1/auth/verify-student  -> called by the NextAuth Credentials provider's
                                      authorize() to validate a SUT Student ID. Returns
                                      a token so the endpoint is also usable standalone.

The SUT-ID check here is a clearly-marked STUB (format + optional allowlist). Swap
it for the real SUT registry/API integration when available.
"""

from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from core.auth import AuthUser, create_access_token, get_current_user
from core.ratelimit import limiter
from models import database as db

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# STUB: SUT student IDs look like a letter prefix + 7 digits (e.g. B6312345).
_SUT_ID = re.compile(r"^[BMD]\d{7}$")


@router.get("/me", response_model=AuthUser)
def me(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    db.upsert_user(user.model_dump())
    return user


class VerifyStudentRequest(BaseModel):
    student_id: str
    name: str | None = None
    program: str | None = None


@router.post("/verify-student")
@limiter.limit("10/minute")
def verify_student(request: Request, req: VerifyStudentRequest) -> dict:
    sid = req.student_id.strip().upper()
    if not _SUT_ID.match(sid):
        raise HTTPException(status_code=401, detail="Unrecognized SUT Student ID")
    claims = {
        "sub": sid,
        "role": "student",
        "student_id": sid,
        "program": req.program,
        "name": req.name,
        "provider": "credentials",
    }
    return {"valid": True, "user": claims, "token": create_access_token(claims)}
