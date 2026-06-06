"""POST /api/v1/assessment/submit — compute MES, cache Top-10 (Section 6.1)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List

from fastapi import APIRouter, Request

from core.algorithm import recommend_careers
from core.gap_analyzer import analyze_gap
from core.ratelimit import limiter
from models import database as db
from models.schemas import AssessmentSubmit, CareerResult, Top10Response

router = APIRouter(prefix="/api/v1/assessment", tags=["assessment"])


def annotate_strengths_gaps(student_scores: Dict[str, float], career: Dict) -> Dict[str, List[str]]:
    """Top-2 strengths and gaps (by magnitude) for a single career card."""
    analysis = analyze_gap(student_scores, career["competency_vector"])
    return {
        "top_strengths": [s["competency_id"] for s in analysis["strengths"][:2]],
        "top_gaps": [g["competency_id"] for g in analysis["gaps"][:2]],
    }


def build_top10(student_scores: Dict[str, float]) -> List[Dict]:
    careers = db.get_careers()
    by_id = {c["career_id"]: c for c in careers}
    top10 = recommend_careers(student_scores, careers)
    for item in top10:
        item.update(annotate_strengths_gaps(student_scores, by_id[item["career_id"]]))
    return top10


@router.post("/submit", response_model=Top10Response)
@limiter.limit("20/minute")
def submit_assessment(request: Request, payload: AssessmentSubmit) -> Top10Response:
    top10 = build_top10(payload.scores)
    timestamp = datetime.now(timezone.utc).isoformat()
    assessment_id = f"ASM_{payload.user_id}"

    db.save_assessment(
        payload.user_id,
        {
            "scores": payload.scores,
            "top10": top10,
            "meta": payload.model_dump(),
            "assessment_id": assessment_id,
            "dream_career_group": payload.dream_career_group,
            "dream_career_id": payload.dream_career_id,
        },
    )

    return Top10Response(
        assessment_id=assessment_id,
        user_id=payload.user_id,
        timestamp=timestamp,
        top10_careers=[CareerResult(**c) for c in top10],
        dream_career_group=payload.dream_career_group,
        dream_career_id=payload.dream_career_id,
    )
