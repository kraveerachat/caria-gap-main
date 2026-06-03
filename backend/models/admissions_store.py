"""
Lead_Candidates store — the B2B lead-generation sink for the Fast-Track funnel.

A matched student who submits the "One-Click Fast-Track Application" becomes a
qualified lead for the SUT (the B2B customer). This module owns a small SQLite
table that records each application so the pipeline is real and inspectable,
not just an in-memory mock. Uploaded artifacts (the user's transcript and the
auto-generated CARIA Competency Report) are persisted under data/uploads/ and
referenced by path from the row.

Local-first by design: a single-file SQLite DB sits next to the JSON datasets
and is created on first write, so nothing else needs provisioning to demo.
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_DB_PATH = _DATA_DIR / "leads.sqlite3"
UPLOAD_DIR = _DATA_DIR / "uploads"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_schema(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS Lead_Candidates (
            lead_id        TEXT PRIMARY KEY,
            user_id        TEXT NOT NULL,
            mes_score      REAL NOT NULL,
            target_track   TEXT NOT NULL,
            transcript_path     TEXT,
            transcript_name     TEXT,
            caria_report_path   TEXT,
            caria_report_bytes  INTEGER,
            status         TEXT NOT NULL DEFAULT 'received',
            submitted_at   TEXT NOT NULL
        )
        """
    )
    conn.commit()


def init_db() -> None:
    """Create the data dir, upload dir, and Lead_Candidates table if missing."""
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with _connect() as conn:
        _ensure_schema(conn)


def insert_lead(record: Dict) -> None:
    """Persist a single Fast-Track application into Lead_Candidates."""
    with _connect() as conn:
        _ensure_schema(conn)
        conn.execute(
            """
            INSERT INTO Lead_Candidates (
                lead_id, user_id, mes_score, target_track,
                transcript_path, transcript_name,
                caria_report_path, caria_report_bytes,
                status, submitted_at
            ) VALUES (
                :lead_id, :user_id, :mes_score, :target_track,
                :transcript_path, :transcript_name,
                :caria_report_path, :caria_report_bytes,
                :status, :submitted_at
            )
            """,
            {
                "status": "received",
                "submitted_at": datetime.now(timezone.utc).isoformat(),
                **record,
            },
        )
        conn.commit()


def count_leads() -> int:
    with _connect() as conn:
        _ensure_schema(conn)
        row = conn.execute("SELECT COUNT(*) AS n FROM Lead_Candidates").fetchone()
        return int(row["n"]) if row else 0


def list_leads(limit: int = 50) -> List[Dict]:
    with _connect() as conn:
        _ensure_schema(conn)
        rows = conn.execute(
            "SELECT * FROM Lead_Candidates ORDER BY submitted_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]


def save_upload(lead_id: str, kind: str, filename: Optional[str], content: bytes) -> Optional[str]:
    """Write an uploaded artifact to data/uploads/<lead_id>/ and return its path.

    `kind` is a short slug (e.g. "transcript", "caria_report") used as the
    on-disk filename stem so a lead folder stays self-describing.
    """
    if not content:
        return None
    folder = UPLOAD_DIR / lead_id
    folder.mkdir(parents=True, exist_ok=True)
    suffix = ".pdf"
    if filename and "." in filename:
        suffix = "." + filename.rsplit(".", 1)[-1].lower()
    dest = folder / f"{kind}{suffix}"
    dest.write_bytes(content)
    return str(dest.relative_to(_DATA_DIR.parent))
