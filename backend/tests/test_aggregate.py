"""Faculty-gap aggregation (core.aggregate) — pure-function tests, no DB."""

from core.aggregate import compute_faculty_gaps


def test_compute_faculty_gaps_deficit_is_negative_and_counted():
    careers = [
        {
            "career_id": "C1",
            "career_name": "Test Career",
            "career_group": "G",
            "program": "DT",
            "competency_vector": {"S20_Programming": 80, "S14_Mathematics": 70},
        }
    ]
    # One student, below requirement on both competencies, targeting C1.
    assessments = [
        {"scores": {"S20_Programming": 50, "S14_Mathematics": 40}, "dream_career_id": "C1"}
    ]

    rows, n = compute_faculty_gaps(assessments, careers, academic_year=2569)
    assert n == 1

    by = {r["competency_id"]: r for r in rows}
    # 80 - 50 = 30 deficit, stored negative to match the TOP_GAPS sign convention.
    assert by["S20_Programming"]["avg_gap"] == -30.0
    assert by["S20_Programming"]["students_below_threshold"] == 1
    assert by["S14_Mathematics"]["avg_gap"] == -30.0
    # Rows are sorted most-severe first.
    assert rows[0]["avg_gap"] <= rows[-1]["avg_gap"]


def test_compute_faculty_gaps_skips_empty_scores():
    careers = [{"career_id": "C1", "career_name": "X", "career_group": "G",
                "program": "DT", "competency_vector": {"S20_Programming": 80}}]
    rows, n = compute_faculty_gaps([{"scores": {}, "dream_career_id": "C1"}], careers)
    assert n == 0
    assert rows == []
