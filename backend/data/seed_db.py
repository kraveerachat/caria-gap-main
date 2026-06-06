"""
One-shot Postgres seeder for the CARIA-GAP migration (Roadmap Phase 1).

Reads the existing local-first datasets and copies them into the database that
DATABASE_URL points at:

  - competencies.json  -> competency
  - careers.json       -> career (competency_vector kept as JSON)
  - courses.json       -> course + competency_course (from the by_competency index)
  - leads.sqlite3      -> lead_candidate (straight column copy)

Inert as a module: nothing runs on import. It executes only when invoked
explicitly, and only after deps are installed and the schema exists (via Alembic):

    cd backend
    export DATABASE_URL="postgresql+psycopg://user:pass@host:5432/caria"
    python -m data.seed_db

The seed is idempotent: it upserts by primary key, so re-running is safe.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Dict, List

from sqlmodel import Session, select

from models.db_session import get_engine
from models.orm import (
    Career,
    Competency,
    CompetencyCourse,
    Course,
    Lead,
)

_DATA_DIR = Path(__file__).resolve().parent


def _load(name: str) -> dict:
    with open(_DATA_DIR / name, encoding="utf-8") as f:
        return json.load(f)


def _upsert(session: Session, model, pk_field: str, rows: List[dict]) -> int:
    """Insert-or-update each row by primary key. Returns the count processed."""
    for row in rows:
        existing = session.get(model, row[pk_field])
        if existing:
            for k, v in row.items():
                setattr(existing, k, v)
        else:
            session.add(model(**row))
    return len(rows)


def seed_competencies(session: Session) -> int:
    rows = _load("competencies.json")["competencies"]
    return _upsert(session, Competency, "id", rows)


def seed_careers(session: Session) -> int:
    rows = _load("careers.json")["careers"]
    cleaned = [
        {
            "career_id": c["career_id"],
            "career_name": c["career_name"],
            "career_group": c["career_group"],
            "program": c["program"],
            "is_placeholder_name": c.get("is_placeholder_name", False),
            "competency_vector": c["competency_vector"],
        }
        for c in rows
    ]
    return _upsert(session, Career, "career_id", cleaned)


def seed_courses(session: Session) -> int:
    """Flatten courses.json `by_competency` into the course table plus the
    competency_course link table."""
    by_competency: Dict[str, List[dict]] = _load("courses.json")["by_competency"]
    seen: Dict[str, dict] = {}
    links: List[dict] = []
    for competency_id, course_list in by_competency.items():
        for rank, c in enumerate(course_list):
            seen[c["course_id"]] = {
                "course_id": c["course_id"],
                "title": c["title"],
                "provider": c["provider"],
                "price_thb": c.get("price_thb", 0),
                "duration_hours": c.get("duration_hours", 0),
                "level": c.get("level"),
                "url": c["url"],
                "affiliate": c.get("affiliate", True),
                "thumbnail_url": c.get("thumbnail_url"),
            }
            links.append(
                {"competency_id": competency_id, "course_id": c["course_id"], "rank": rank}
            )
    _upsert(session, Course, "course_id", list(seen.values()))
    # Composite-PK upsert for the link table.
    for link in links:
        existing = session.get(CompetencyCourse, (link["competency_id"], link["course_id"]))
        if existing:
            existing.rank = link["rank"]
        else:
            session.add(CompetencyCourse(**link))
    return len(seen)


def migrate_leads(session: Session) -> int:
    """Copy the existing SQLite Lead_Candidates rows into lead_candidate."""
    sqlite_path = _DATA_DIR / "leads.sqlite3"
    if not sqlite_path.exists():
        return 0
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute("SELECT * FROM Lead_Candidates").fetchall()
    except sqlite3.OperationalError:
        return 0  # table not created yet
    finally:
        conn.close()
    count = 0
    for r in rows:
        d = dict(r)
        if session.get(Lead, d["lead_id"]):
            continue
        session.add(Lead(**{k: d.get(k) for k in Lead.model_fields if k in d}))
        count += 1
    return count


def run() -> None:
    with Session(get_engine()) as session:
        n_comp = seed_competencies(session)
        n_career = seed_careers(session)
        n_course = seed_courses(session)
        n_lead = migrate_leads(session)
        session.commit()
    print(
        f"Seeded: {n_comp} competencies, {n_career} careers, "
        f"{n_course} courses, {n_lead} leads migrated."
    )


if __name__ == "__main__":
    run()
