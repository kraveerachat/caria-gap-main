"""Guest -> user result claiming (Roadmap Phase 2).

  POST /api/v1/results/claim { anon_id }  -> re-keys the anonymous assessments
  stored under `anon_id` to the now-authenticated user, so nothing is lost when a
  guest decides to sign in. Mirrors the promise in frontend/src/lib/mock-auth.ts.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core.auth import AuthUser, get_current_user
from models import database as db

router = APIRouter(prefix="/api/v1/results", tags=["results"])


class ClaimRequest(BaseModel):
    anon_id: str


@router.post("/claim")
def claim_results(req: ClaimRequest, user: AuthUser = Depends(get_current_user)) -> dict:
    user_id = db.upsert_user(user.model_dump())
    claimed = db.claim_assessments(req.anon_id, user_id)
    return {"status": "ok", "claimed": claimed, "user_id": user_id}
