"""
Faculty-gap aggregation (Roadmap Phase 3/4): compute real competency gaps across
all stored assessments and persist them to `faculty_gap_snapshot`, replacing the
hand-maintained `stats_mock.json` TOP_GAPS with derived data. Meant to run on a
schedule (the "nightly job"); also runnable on demand:

    cd backend
    export DATABASE_URL="sqlite:///./data/caria_dev.db"
    python -m core.aggregate
"""

from __future__ import annotations

from collections import defaultdict
from typing import Dict, List, Tuple

from core.algorithm import recommend_careers
from core.gap_analyzer import analyze_gap

DEFAULT_YEAR = 2569


def compute_faculty_gaps(
    assessments: List[Dict],
    careers: List[Dict],
    academic_year: int = DEFAULT_YEAR,
) -> Tuple[List[Dict], int]:
    """For each assessment, pick its target career (declared dream, else top MES
    match), compute per-competency gaps, and aggregate average gap + how many
    students fall short on each competency. avg_gap is negative (a deficit), to
    match the existing TOP_GAPS sign convention."""
    by_id = {c["career_id"]: c for c in careers}
    sums: Dict[str, float] = defaultdict(float)
    counts: Dict[str, int] = defaultdict(int)
    n = 0

    for a in assessments:
        scores = a.get("scores") or {}
        if not scores:
            continue
        target_id = a.get("dream_career_id")
        career = by_id.get(target_id) if target_id else None
        if career is None:
            ranked = recommend_careers(scores, careers)
            if not ranked:
                continue
            career = by_id.get(ranked[0]["career_id"])
        if career is None:
            continue

        n += 1
        for gap in analyze_gap(scores, career["competency_vector"])["gaps"]:
            cid = gap["competency_id"]
            sums[cid] += gap["gap_score"]
            counts[cid] += 1

    rows = [
        {
            "academic_year": academic_year,
            "competency_id": cid,
            "avg_gap": round(-sums[cid] / counts[cid], 1),
            "students_below_threshold": counts[cid],
        }
        for cid in counts
    ]
    rows.sort(key=lambda r: r["avg_gap"])  # most severe deficit first
    return rows, n


def run(academic_year: int = DEFAULT_YEAR) -> None:
    from sqlmodel import Session, delete, select

    from models import database as db
    from models.db_session import get_engine
    from models.orm import AssessmentResult, FacultyGapSnapshot

    careers = db.get_careers()
    with Session(get_engine()) as s:
        results = s.exec(select(AssessmentResult)).all()
        assessments = [
            {"scores": r.scores, "dream_career_id": r.dream_career_id} for r in results
        ]
        rows, n = compute_faculty_gaps(assessments, careers, academic_year)

        s.exec(delete(FacultyGapSnapshot).where(FacultyGapSnapshot.academic_year == academic_year))
        for row in rows:
            s.add(FacultyGapSnapshot(**row))
        s.commit()

    print(f"Computed faculty gaps from {n} assessments -> {len(rows)} competency snapshots.")
    for r in rows[:5]:
        print(f"  {r['competency_id']:34} avg_gap={r['avg_gap']:>7}  below={r['students_below_threshold']}")


if __name__ == "__main__":
    run()
