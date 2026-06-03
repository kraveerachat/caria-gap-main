"""
CARIA-GAP FastAPI application entrypoint.

Run (dev):
    uvicorn main:app --reload
Docs:
    http://127.0.0.1:8000/docs

Based on: Seesukong et al. (2024), CARIA, IJICTE 20(1), DOI 10.4018/IJICTE.356499.
"""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from models import database as db
from models import admissions_store
from routers import admissions, assessment, gap_analysis, recommendations, simulate

app = FastAPI(
    title="CARIA-GAP API",
    version="2.0",
    description="Career recommendation + competency gap analysis built on the CARIA "
    "Modified Euclidean Similarity model (Eq.1 capping + Eq.2 MES, 66 dimensions, scale 0-100).",
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "message": exc.detail,
                "details": None
            }
        )
    if isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "status": "error",
                "message": "Validation Error",
                "details": exc.errors()
            }
        )
    # Generic unhandled exception (500)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Error processing request",
            "details": str(exc),
        },
    )

# CORS — Next.js dev server + Vercel deploys.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assessment.router)
app.include_router(recommendations.router)
app.include_router(gap_analysis.router)
app.include_router(simulate.router)
app.include_router(admissions.router)


@app.on_event("startup")
def _startup() -> None:
    # Pre-cache demo personas so the API is pitch-ready immediately.
    db.seed_personas()
    # Ensure the Lead_Candidates table + uploads dir exist before first apply.
    admissions_store.init_db()


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "service": "caria-gap", "competencies": 66, "careers": len(db.get_careers())}


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"name": "CARIA-GAP API", "docs": "/docs", "health": "/health"}
