"""DB-backed integration tests (Roadmap Phase 1/2): assessment persistence,
identity upsert, and guest->user claim. Uses an isolated temp SQLite per test so
the JSON-path tests are unaffected (env is monkeypatched + the engine cache cleared).
"""

import os
import tempfile

import pytest
from sqlmodel import Session, SQLModel, select


@pytest.fixture()
def db_env(monkeypatch):
    db_file = tempfile.mktemp(suffix=".db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_file}")
    monkeypatch.setenv("AUTH_SECRET", "test-secret")

    from models import database as db
    from models import orm  # noqa: F401  (registers tables on metadata)
    from models.db_session import get_engine

    # Bind the (cached) engine + reference caches to this test DB.
    get_engine.cache_clear()
    db._db_careers_cache = None
    db._db_competencies_cache = None

    SQLModel.metadata.create_all(get_engine())

    from data.seed_db import seed_careers, seed_competencies, seed_courses

    with Session(get_engine()) as s:
        seed_competencies(s)
        seed_careers(s)
        seed_courses(s)
        s.commit()

    yield

    get_engine.cache_clear()
    db._db_careers_cache = None
    db._db_competencies_cache = None
    try:
        os.remove(db_file)
    except OSError:
        pass


def _client():
    from fastapi.testclient import TestClient
    import main

    return TestClient(main.app)


def _scores():
    from models import database as db

    return db.get_personas()[0]["scores"]


def test_assessment_persists_and_reads_back(db_env):
    with _client() as c:
        submit = c.post(
            "/api/v1/assessment/submit",
            json={"user_id": "anon_test", "program": "DT", "scores": _scores(), "input_method": "manual"},
        )
        assert submit.status_code == 200, submit.text
        top1 = submit.json()["top10_careers"][0]["career_id"]

        rec = c.get("/api/v1/recommendations/anon_test")
        assert rec.status_code == 200, rec.text
        assert rec.json()["top10_careers"][0]["career_id"] == top1


def test_me_upserts_user(db_env):
    from core.auth import create_access_token
    from models.db_session import get_engine
    from models.orm import User

    token = create_access_token(
        {"sub": "B6312345", "role": "student", "student_id": "B6312345", "program": "DT", "name": "Somchai"}
    )
    with _client() as c:
        me = c.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["role"] == "student"

    with Session(get_engine()) as s:
        user = s.exec(select(User).where(User.student_id == "B6312345")).first()
        assert user is not None and user.role == "student"


def test_claim_rekeys_guest_assessment(db_env):
    from core.auth import create_access_token
    from models.db_session import get_engine
    from models.orm import AssessmentResult

    token = create_access_token({"sub": "B6312345", "role": "student", "student_id": "B6312345"})
    with _client() as c:
        c.post(
            "/api/v1/assessment/submit",
            json={"user_id": "guest_1", "program": "DT", "scores": _scores(), "input_method": "manual"},
        )
        claim = c.post(
            "/api/v1/results/claim",
            json={"anon_id": "guest_1"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert claim.status_code == 200, claim.text
        assert claim.json()["claimed"] >= 1

    with Session(get_engine()) as s:
        row = s.exec(select(AssessmentResult).where(AssessmentResult.anon_id == "guest_1")).first()
        assert row is not None and row.user_id is not None
