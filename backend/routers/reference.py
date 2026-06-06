"""Reference-data endpoints (Roadmap Phase 3): let the frontend fetch the
careers list, competency catalog, and admin stats instead of hardcoding them in
TypeScript. Shapes match the existing frontend constants so the swap is a
drop-in. Careers omit the heavy competency_vector here (the What-if slider loads
vectors separately)."""

from __future__ import annotations

from fastapi import APIRouter

from models import database as db

router = APIRouter(prefix="/api/v1", tags=["reference"])


@router.get("/careers")
def list_careers() -> dict:
    careers = [
        {k: v for k, v in c.items() if k != "competency_vector"}
        for c in db.get_careers()
    ]
    return {"careers": careers}


@router.get("/competencies")
def list_competencies() -> dict:
    return {"competencies": db.get_competencies()}


@router.get("/admin/stats")
def admin_stats() -> dict:
    return db.get_admin_stats()


@router.get("/admin/faculty-gaps")
def faculty_gaps() -> dict:
    """Derived per-competency gap aggregates (computed by core.aggregate from
    assessment_result). Empty until the aggregation job has run / a DB is set."""
    import os

    if not os.getenv("DATABASE_URL"):
        return {"faculty_gaps": [], "computed": False}

    from sqlmodel import Session, select

    from models.db_session import get_engine
    from models.orm import FacultyGapSnapshot

    with Session(get_engine()) as s:
        rows = s.exec(
            select(FacultyGapSnapshot).order_by(FacultyGapSnapshot.avg_gap)
        ).all()
    return {"faculty_gaps": [r.model_dump() for r in rows], "computed": True}
