"""Shared rate limiter (Roadmap Phase 4).

Defined in its own module so routers and main.py import the same Limiter instance
without a circular import. Keyed by client IP; in-memory storage by default (swap
for Redis via `storage_uri` in production behind multiple workers).
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
