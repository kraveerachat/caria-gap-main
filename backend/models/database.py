"""
Data access for CARIA-GAP.

Two interchangeable backends behind one stable API (the routers call only these
functions and never change):

  * DATABASE_URL unset  -> local-first: JSON datasets + in-memory assessment cache
                           (the original prototype behavior, byte-identical).
  * DATABASE_URL set    -> SQLModel/Postgres (or SQLite): careers come from the
                           `career` table, assessments persist in `assessment_result`.

This is the Roadmap Phase 1 router-repoint, done at the data-access seam rather
than in every router, so response shapes stay frozen and the UI never changes.

Pre-auth note: an assessment's `user_id` from the API is an anonymous/demo key
(real identities arrive in Phase 2). It is stored in `assessment_result.anon_id`
(no FK), leaving the `user_id` FK NULL until a login claims the row.

Reference competency keys/labels and the course catalog are still read from JSON
by core/algorithm.py and core/gap_analyzer.py; that data is static and identical
either way, so it stays put for now.
"""

from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _use_db() -> bool:
    """True when a database is configured; otherwise the JSON/in-memory path runs."""
    return bool(os.getenv("DATABASE_URL"))


# --------------------------------------------------------------------------- #
# Local-first JSON loaders (used when DATABASE_URL is unset)
# --------------------------------------------------------------------------- #
def _load(name: str) -> dict:
    with open(_DATA_DIR / name, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def _json_careers() -> List[Dict]:
    return _load("careers.json")["careers"]


@lru_cache(maxsize=1)
def _json_competencies() -> List[Dict]:
    return _load("competencies.json")["competencies"]


@lru_cache(maxsize=1)
def _json_personas() -> List[Dict]:
    return _load("personas.json")["personas"]


@lru_cache(maxsize=1)
def _json_admin_stats() -> dict:
    return _load("stats_mock.json")


def get_admin_stats() -> dict:
    """Aggregate stats for the B2B admin dashboard. JSON-backed for now; the
    FacultyGapSnapshot job will compute these from assessment_result later."""
    return _json_admin_stats()


# --------------------------------------------------------------------------- #
# Database loaders (used when DATABASE_URL is set). Cached per process; the
# reference tables are static for the life of a run.
# --------------------------------------------------------------------------- #
_db_careers_cache: Optional[List[Dict]] = None
_db_competencies_cache: Optional[List[Dict]] = None


def _db_careers() -> List[Dict]:
    global _db_careers_cache
    if _db_careers_cache is None:
        from sqlmodel import Session, select

        from models.db_session import get_engine
        from models.orm import Career

        with Session(get_engine()) as s:
            rows = s.exec(select(Career)).all()
            _db_careers_cache = [
                {
                    "career_id": r.career_id,
                    "career_name": r.career_name,
                    "career_group": r.career_group,
                    "program": r.program,
                    "is_placeholder_name": r.is_placeholder_name,
                    "competency_vector": r.competency_vector,
                }
                for r in rows
            ]
    return _db_careers_cache


def _db_competencies() -> List[Dict]:
    global _db_competencies_cache
    if _db_competencies_cache is None:
        from sqlmodel import Session, select

        from models.db_session import get_engine
        from models.orm import Competency

        with Session(get_engine()) as s:
            rows = s.exec(select(Competency)).all()
            _db_competencies_cache = [
                {"id": r.id, "domain": r.domain, "label_en": r.label_en, "label_th": r.label_th}
                for r in rows
            ]
    return _db_competencies_cache


# --------------------------------------------------------------------------- #
# Public reference-data API (dispatches by backend)
# --------------------------------------------------------------------------- #
def get_careers() -> List[Dict]:
    return _db_careers() if _use_db() else _json_careers()


def get_competencies() -> List[Dict]:
    return _db_competencies() if _use_db() else _json_competencies()


def get_personas() -> List[Dict]:
    # Personas are the seed source for demo assessments; always read from JSON.
    return _json_personas()


def get_career(career_id: str) -> Optional[Dict]:
    return next((c for c in get_careers() if c["career_id"] == career_id), None)


# --------------------------------------------------------------------------- #
# Assessment store: in-memory dict (no DB) or assessment_result table (DB)
# --------------------------------------------------------------------------- #
_ASSESSMENT_CACHE: Dict[str, Dict] = {}


def save_assessment(user_id: str, record: Dict) -> None:
    if _use_db():
        _db_save_assessment(user_id, record)
    else:
        _ASSESSMENT_CACHE[user_id] = record


def get_assessment(user_id: str) -> Optional[Dict]:
    if _use_db():
        return _db_get_assessment(user_id)
    return _ASSESSMENT_CACHE.get(user_id)


def _db_save_assessment(user_id: str, record: Dict) -> None:
    """Upsert the latest assessment for a pre-auth key into assessment_result."""
    from sqlmodel import Session, select

    from models.db_session import get_engine
    from models.orm import AssessmentResult

    meta = record.get("meta") or {}
    with Session(get_engine()) as s:
        row = s.exec(
            select(AssessmentResult)
            .where(AssessmentResult.anon_id == user_id)
            .order_by(AssessmentResult.created_at.desc())
        ).first()
        if row is None:
            row = AssessmentResult(anon_id=user_id, program=meta.get("program") or "")
        row.program = meta.get("program") or row.program or ""
        row.year = meta.get("year")
        row.gpa = meta.get("gpa")
        row.scores = record.get("scores") or {}
        row.input_method = meta.get("input_method")
        row.dream_career_group = record.get("dream_career_group") or meta.get("dream_career_group")
        row.dream_career_id = record.get("dream_career_id") or meta.get("dream_career_id")
        row.top10 = record.get("top10") or []
        s.add(row)
        s.commit()


def _db_get_assessment(user_id: str) -> Optional[Dict]:
    from sqlmodel import Session, select

    from models.db_session import get_engine
    from models.orm import AssessmentResult

    with Session(get_engine()) as s:
        row = s.exec(
            select(AssessmentResult)
            .where(AssessmentResult.anon_id == user_id)
            .order_by(AssessmentResult.created_at.desc())
        ).first()
        if row is None:
            return None
        return {
            "scores": row.scores or {},
            "top10": row.top10 or None,  # None/[] -> recommendations recomputes lazily
            "assessment_id": f"ASM_{user_id}",
            "dream_career_group": row.dream_career_group,
            "dream_career_id": row.dream_career_id,
            "meta": {
                "user_id": user_id,
                "program": row.program,
                "year": row.year,
                "gpa": row.gpa,
                "input_method": row.input_method,
                "dream_career_group": row.dream_career_group,
                "dream_career_id": row.dream_career_id,
            },
        }


# --------------------------------------------------------------------------- #
# Demo seeding (startup): pre-load persona assessments so the API is pitch-ready
# --------------------------------------------------------------------------- #
def seed_personas() -> None:
    if _use_db():
        _db_seed_personas()
        return
    for p in get_personas():
        if p["user_id"] not in _ASSESSMENT_CACHE:
            _ASSESSMENT_CACHE[p["user_id"]] = {"scores": p["scores"], "meta": p, "top10": None}


def _db_seed_personas() -> None:
    from sqlmodel import Session, select

    from models.db_session import get_engine
    from models.orm import AssessmentResult

    with Session(get_engine()) as s:
        for p in get_personas():
            exists = s.exec(
                select(AssessmentResult).where(AssessmentResult.anon_id == p["user_id"])
            ).first()
            if exists:
                continue
            s.add(
                AssessmentResult(
                    anon_id=p["user_id"],
                    program=p.get("program", ""),
                    year=p.get("year"),
                    gpa=p.get("gpa"),
                    scores=p["scores"],
                    input_method="seed",
                    top10=[],
                )
            )
        s.commit()


# --------------------------------------------------------------------------- #
# Identity (Phase 2): DB-only. Auth implies a configured database.
# --------------------------------------------------------------------------- #
def upsert_user(claims: Dict) -> str:
    """Create or update the User row from JWT claims; returns its id."""
    if not _use_db():
        raise RuntimeError("Auth requires DATABASE_URL to be configured")
    from sqlmodel import Session, select

    from models.db_session import get_engine
    from models.orm import User

    sub = claims.get("sub")
    student_id = claims.get("student_id")
    # Student-ID logins may have no email; synthesize a stable one.
    email = claims.get("email") or (f"{sub}@students.sut.ac.th" if sub else None)

    with Session(get_engine()) as s:
        row = None
        if email:
            row = s.exec(select(User).where(User.email == email)).first()
        if row is None and student_id:
            row = s.exec(select(User).where(User.student_id == student_id)).first()
        if row is None:
            row = User(email=email or f"{sub}@unknown.local")
        row.name = claims.get("name") or row.name
        row.role = claims.get("role") or row.role or "guest"
        row.student_id = student_id or row.student_id
        row.program = claims.get("program") or row.program
        row.provider = claims.get("provider") or row.provider or "credentials"
        s.add(row)
        s.commit()
        s.refresh(row)
        return row.id


def claim_assessments(anon_id: str, user_id: str) -> int:
    """Re-key anonymous assessments to a now-authenticated user. Returns count."""
    if not _use_db():
        raise RuntimeError("Auth requires DATABASE_URL to be configured")
    from sqlmodel import Session, select

    from models.db_session import get_engine
    from models.orm import AssessmentResult

    with Session(get_engine()) as s:
        rows = s.exec(select(AssessmentResult).where(AssessmentResult.anon_id == anon_id)).all()
        for r in rows:
            r.user_id = user_id
            s.add(r)
        s.commit()
        return len(rows)
