"""
Database engine + session management for the Postgres migration (Roadmap Phase 1).

Lazy by design: importing this module does NOT open a connection or touch a
database. The engine is created on first use, reading DATABASE_URL from the
environment. This keeps `main.py` import-safe even before Postgres is provisioned,
so the app continues running on the current local-first stores until the routers
are explicitly repointed.

Usage (later, in routers, once wired in):

    from models.db_session import get_session
    @router.get(...)
    def handler(session: Session = Depends(get_session)):
        ...

Local example:
    export DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/caria"
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Iterator

from sqlalchemy.engine import Engine
from sqlmodel import Session, create_engine

DATABASE_URL_ENV = "DATABASE_URL"


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """Build (once) and return the SQLAlchemy engine. Raises a clear error if
    DATABASE_URL is unset, rather than silently connecting to nothing."""
    url = os.getenv(DATABASE_URL_ENV)
    if not url:
        raise RuntimeError(
            f"{DATABASE_URL_ENV} is not set. Provision Postgres and export it, e.g. "
            "postgresql+psycopg://user:pass@host:5432/caria"
        )
    # pool_pre_ping avoids stale-connection errors on managed Postgres (Neon/RDS).
    return create_engine(url, pool_pre_ping=True, echo=False)


def get_session() -> Iterator[Session]:
    """FastAPI dependency: yields a session bound to the lazily-built engine."""
    with Session(get_engine()) as session:
        yield session
