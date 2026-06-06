"""
SQLModel table definitions for the CARIA-GAP Postgres migration (Roadmap Phase 1).

These mirror the existing API contract one-to-one (snake_case, matching
models/schemas.py and frontend/src/types/index.ts) so that when the routers are
repointed from the JSON/SQLite stores to the database, the response shapes stay
byte-identical and the UI does not change.

NOT YET WIRED IN: nothing here is imported by main.py or the routers. It becomes
live only after deps are installed (`pip install -r requirements.txt`), a Postgres
DATABASE_URL is provisioned, and the first Alembic migration is applied. Until
then the app keeps running on the current local-first stores.

Naming: column names stay snake_case to preserve the wire contract. Competency
vectors and score maps use JSON columns (JSONB on Postgres) because the MES engine
loads each vector whole rather than querying into it.

NOTE: no `from __future__ import annotations` here on purpose. It would turn the
Relationship() annotations into plain strings that SQLModel cannot resolve into
mappers (InvalidRequestError on configure).
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from uuid import uuid4

from sqlalchemy import JSON, Column
from sqlmodel import Field, Relationship, SQLModel


def _uuid() -> str:
    return uuid4().hex


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# --------------------------------------------------------------------------- #
# Reference data  (today: data/competencies.json, careers.json, courses.json)
# --------------------------------------------------------------------------- #
class Competency(SQLModel, table=True):
    __tablename__ = "competency"

    id: str = Field(primary_key=True)            # "S01_Active_Learning"
    domain: str = Field(index=True)              # "skill" | "attitude" | "knowledge"
    label_en: str
    label_th: str

    course_links: List["CompetencyCourse"] = Relationship(back_populates="competency")


class Career(SQLModel, table=True):
    __tablename__ = "career"

    career_id: str = Field(primary_key=True)     # "DT08"
    career_name: str
    career_group: str = Field(index=True)
    program: str = Field(index=True)             # "DT" | "DM"
    is_placeholder_name: bool = Field(default=False)
    # JSONB on Postgres; loaded whole by the MES engine, never queried into.
    competency_vector: Dict[str, float] = Field(
        default_factory=dict, sa_column=Column(JSON)
    )

    demands: List["CompanyDemand"] = Relationship(back_populates="career")


class Course(SQLModel, table=True):
    __tablename__ = "course"

    course_id: str = Field(primary_key=True)     # "CR001" / "C001"
    title: str
    provider: str
    price_thb: int = Field(default=0)
    duration_hours: int = Field(default=0)
    level: Optional[str] = None
    url: str
    affiliate: bool = Field(default=True)
    thumbnail_url: Optional[str] = None

    competency_links: List["CompetencyCourse"] = Relationship(back_populates="course")


class CompetencyCourse(SQLModel, table=True):
    """Maps a gap (competency) to the courses that close it. Normalizes the
    `courses.json` `by_competency` index so /gap-analysis can join in SQL."""

    __tablename__ = "competency_course"

    competency_id: str = Field(foreign_key="competency.id", primary_key=True)
    course_id: str = Field(foreign_key="course.course_id", primary_key=True)
    rank: int = Field(default=0)                 # display order within a competency

    competency: Optional[Competency] = Relationship(back_populates="course_links")
    course: Optional[Course] = Relationship(back_populates="competency_links")


# --------------------------------------------------------------------------- #
# Identity  (Phase 2 fills this in; defined now so results can FK to it)
# --------------------------------------------------------------------------- #
class User(SQLModel, table=True):
    __tablename__ = "app_user"

    id: str = Field(default_factory=_uuid, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: Optional[str] = None
    image: Optional[str] = None
    provider: str = Field(default="guest")       # google | facebook | credentials | guest
    role: str = Field(default="guest", index=True)  # guest | student | admin
    student_id: Optional[str] = Field(default=None, unique=True)  # SUT Student ID
    program: Optional[str] = None
    year: Optional[int] = None
    gpa: Optional[float] = None
    created_at: datetime = Field(default_factory=_utcnow)

    results: List["AssessmentResult"] = Relationship(back_populates="user")
    leads: List["Lead"] = Relationship(back_populates="user")


# --------------------------------------------------------------------------- #
# Per-user results  (today: in-memory _ASSESSMENT_CACHE + localStorage)
# --------------------------------------------------------------------------- #
class AssessmentResult(SQLModel, table=True):
    __tablename__ = "assessment_result"

    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: Optional[str] = Field(default=None, foreign_key="app_user.id", index=True)
    anon_id: Optional[str] = Field(default=None, index=True)  # guest cookie, for claiming
    program: str
    year: Optional[int] = None
    gpa: Optional[float] = None
    scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    input_method: Optional[str] = Field(default="manual")
    dream_career_group: Optional[str] = None
    dream_career_id: Optional[str] = None
    # Snapshot of CareerResult[] at compute time so history is stable.
    top10: List[dict] = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=_utcnow)

    user: Optional[User] = Relationship(back_populates="results")


# --------------------------------------------------------------------------- #
# B2B / admin analytics  (today: lib/adminStats.ts, IndustryDemand)
# --------------------------------------------------------------------------- #
class CompanyDemand(SQLModel, table=True):
    __tablename__ = "company_demand"

    id: str = Field(default_factory=_uuid, primary_key=True)
    company_name: str
    career_id: str = Field(foreign_key="career.career_id", index=True)
    openings: int = Field(default=0)
    region: Optional[str] = None
    source_url: Optional[str] = None
    snapshot_date: datetime = Field(default_factory=_utcnow, index=True)

    career: Optional[Career] = Relationship(back_populates="demands")


class FacultyGapSnapshot(SQLModel, table=True):
    """Curriculum-planning output: derived nightly from AssessmentResult.
    Mirrors TOP_GAPS + MODULE_DEMAND_FORECAST in lib/adminStats.ts."""

    __tablename__ = "faculty_gap_snapshot"

    id: str = Field(default_factory=_uuid, primary_key=True)
    academic_year: int = Field(index=True)
    competency_id: str
    avg_gap: float
    students_below_threshold: int
    module_id: Optional[str] = None
    next_term_forecast: Optional[int] = None
    trend: Optional[str] = None                  # "up" | "down"
    computed_at: datetime = Field(default_factory=_utcnow)


# --------------------------------------------------------------------------- #
# Lead-gen / Fast-Track  (today: data/leads.sqlite3 Lead_Candidates table)
# --------------------------------------------------------------------------- #
class Lead(SQLModel, table=True):
    """1:1 with the existing Lead_Candidates SQLite columns, so the migration is
    a straight copy. user_id added as an optional FK for when auth lands."""

    __tablename__ = "lead_candidate"

    lead_id: str = Field(primary_key=True)
    user_id: Optional[str] = Field(default=None, foreign_key="app_user.id", index=True)
    mes_score: float
    target_track: str
    transcript_path: Optional[str] = None
    transcript_name: Optional[str] = None
    caria_report_path: Optional[str] = None
    caria_report_bytes: Optional[int] = None
    status: str = Field(default="received")
    submitted_at: datetime = Field(default_factory=_utcnow)

    user: Optional[User] = Relationship(back_populates="leads")
