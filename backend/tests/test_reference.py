"""Reference + admin endpoints in default (JSON) mode — no DATABASE_URL set."""

from fastapi.testclient import TestClient

import main


def test_careers_endpoint_omits_vector():
    with TestClient(main.app) as c:
        careers = c.get("/api/v1/careers").json()["careers"]
    assert len(careers) == 78
    assert "career_id" in careers[0]
    assert "competency_vector" not in careers[0]  # stripped to keep the list light


def test_competencies_endpoint():
    with TestClient(main.app) as c:
        comps = c.get("/api/v1/competencies").json()["competencies"]
    assert len(comps) == 66
    assert {"id", "domain", "label_en", "label_th"} <= set(comps[0])


def test_admin_stats_endpoint():
    with TestClient(main.app) as c:
        stats = c.get("/api/v1/admin/stats").json()
    assert "career_distribution" in stats and "total_assessments" in stats


def test_faculty_gaps_empty_without_db():
    with TestClient(main.app) as c:
        fg = c.get("/api/v1/admin/faculty-gaps").json()
    assert fg["computed"] is False
    assert fg["faculty_gaps"] == []
