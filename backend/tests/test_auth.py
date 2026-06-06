"""Auth endpoints — the parts that don't require a database."""

from fastapi.testclient import TestClient

import main


def test_me_requires_authentication():
    with TestClient(main.app) as c:
        assert c.get("/api/v1/auth/me").status_code == 401


def test_verify_student_rejects_malformed_id():
    with TestClient(main.app) as c:
        r = c.post("/api/v1/auth/verify-student", json={"student_id": "not-an-id"})
    assert r.status_code == 401


def test_verify_student_issues_token(monkeypatch):
    monkeypatch.setenv("AUTH_SECRET", "test-secret")
    with TestClient(main.app) as c:
        r = c.post(
            "/api/v1/auth/verify-student",
            json={"student_id": "B6312345", "name": "Somchai", "program": "DT"},
        )
    assert r.status_code == 200
    body = r.json()
    assert body["valid"] is True
    assert body["user"]["role"] == "student"
    assert body["user"]["student_id"] == "B6312345"
    assert body["token"]
