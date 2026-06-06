// Auth.js (NextAuth v5) route handler — Roadmap Phase 2.
// Exposes the GET/POST endpoints under /api/v1/.. of NextAuth (signin, callback,
// session, csrf, etc.) by re-exporting the handlers from the central config.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
