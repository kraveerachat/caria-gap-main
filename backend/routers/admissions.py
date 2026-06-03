"""
POST /api/v1/admissions/apply — the "One-Click Fast-Track Application" sink.

Finalizes the B2B lead-generation funnel: a matched student submits their
transcript/portfolio together with the auto-generated CARIA Competency Report,
and the application is recorded as a row in the SQLite Lead_Candidates table
(see models/admissions_store). The response is a mock acceptance the dashboard
can confirm against, carrying the generated lead id.

Accepts multipart/form-data:
    - payload         : JSON string -> { user_id, mes_score, target_track }
    - caria_report    : the client-generated CARIA Competency Report (PDF)
    - transcript      : optional user-uploaded transcript / portfolio (PDF)
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from models import admissions_store as store
from models.schemas import AdmissionApplyResponse, FastTrackApplyPayload

logger = logging.getLogger("caria.admissions")

router = APIRouter(prefix="/api/v1/admissions", tags=["admissions"])

_MAX_PDF_BYTES = 15 * 1024 * 1024  # 15 MB ceiling per uploaded artifact.


def _read_pdf(file: UploadFile | None, field: str, required: bool) -> bytes:
    """Validate an uploaded part is a non-empty PDF within the size ceiling."""
    if file is None:
        if required:
            raise HTTPException(status_code=422, detail=f"Missing required file: {field}")
        return b""
    content = file.file.read()
    if not content:
        if required:
            raise HTTPException(status_code=422, detail=f"Empty file: {field}")
        return b""
    if len(content) > _MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail=f"{field} exceeds 15 MB limit")
    name = (file.filename or "").lower()
    ctype = (file.content_type or "").lower()
    is_pdf = name.endswith(".pdf") or "pdf" in ctype
    if not is_pdf:
        raise HTTPException(status_code=415, detail=f"{field} must be a PDF")
    return content


@router.post("/apply", response_model=AdmissionApplyResponse)
async def apply_fast_track(
    payload: str = Form(..., description="JSON: { user_id, mes_score, target_track }"),
    caria_report: UploadFile = File(..., description="Auto-generated CARIA Competency Report (PDF)"),
    transcript: UploadFile | None = File(None, description="Optional transcript / portfolio (PDF)"),
) -> AdmissionApplyResponse:
    # 1. Parse + validate the JSON payload riding alongside the files.
    try:
        data = FastTrackApplyPayload.model_validate(json.loads(payload))
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=422, detail=f"Invalid payload: {exc}") from exc

    # 2. Validate the file parts (CARIA report required, transcript optional).
    report_bytes = _read_pdf(caria_report, "caria_report", required=True)
    transcript_bytes = _read_pdf(transcript, "transcript", required=False)

    # 3. Mint a lead id and persist artifacts + row (simulated B2B intake).
    lead_id = f"LEAD_{datetime.now(timezone.utc):%Y%m%d}_{uuid.uuid4().hex[:8]}"

    store.init_db()
    report_path = store.save_upload(lead_id, "caria_report", caria_report.filename, report_bytes)
    transcript_path = store.save_upload(
        lead_id, "transcript", transcript.filename if transcript else None, transcript_bytes
    )

    store.insert_lead(
        {
            "lead_id": lead_id,
            "user_id": data.user_id,
            "mes_score": data.mes_score,
            "target_track": data.target_track,
            "transcript_path": transcript_path,
            "transcript_name": transcript.filename if (transcript and transcript_bytes) else None,
            "caria_report_path": report_path,
            "caria_report_bytes": len(report_bytes),
        }
    )

    # 4. Log the intake to simulate the storage step end-to-end.
    logger.info(
        "Fast-Track lead stored in Lead_Candidates | lead_id=%s user_id=%s mes=%.1f "
        "track=%s caria_report=%dB transcript=%s total_leads=%d",
        lead_id,
        data.user_id,
        data.mes_score,
        data.target_track,
        len(report_bytes),
        f"{len(transcript_bytes)}B" if transcript_bytes else "none",
        store.count_leads(),
    )

    return AdmissionApplyResponse(
        status="received",
        lead_id=lead_id,
        user_id=data.user_id,
        target_track=data.target_track,
        mes_score=data.mes_score,
        transcript_attached=bool(transcript_bytes),
        caria_report_attached=True,
        message=(
            "ได้รับใบสมัคร Fast-Track ของคุณเรียบร้อยแล้ว "
            "ทีมรับสมัครหลักสูตร Digitech SUT จะติดต่อกลับโดยเร็ว"
        ),
    )
