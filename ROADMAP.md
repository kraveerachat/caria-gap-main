# CARIA-GAP: Production Transition Roadmap

> Status: planning document. Captures the agreed path from the current two-tier
> prototype to a production-ready full-stack application. No code changes are
> implied by this file; it is the tracker for the four phases below.

## 0. Where we actually are

The repo is **not** a frontend-only prototype. It is already a two-tier app:

- **`backend/`** is a working **FastAPI** service:
  - Routers: `assessment`, `gap_analysis`, `recommendations`, `simulate`, `admissions`.
  - Core IP in Python/numpy: `core/algorithm.py` (Modified Euclidean Similarity
    engine), `core/gap_analyzer.py`, `core/resume_parser.py`.
  - Test coverage: `tests/test_algorithm.py`.
  - Persistence today: flat JSON in `data/` plus **`data/leads.sqlite3`** for
    admissions leads.
- **`frontend/src/lib/api.ts`** already calls the backend at
  `http://127.0.0.1:8000` against a typed contract, with a **silent fallback** to
  `mockData.ts` when the backend is offline.
- **`frontend/src/lib/mes-client.ts`** re-implements the backend Eq.1/Eq.2 in
  TypeScript so the What-if slider re-ranks locally. It must stay numerically
  identical to `backend/core/algorithm.py`.

**The seam that keeps the UI from breaking** through every phase below:
`frontend/src/types/index.ts` plus the endpoint shapes in `frontend/src/lib/api.ts`.
As long as those response shapes stay constant, storage, auth, and data sources
can change underneath without touching components.

## 1. Architecture

**Decision: keep FastAPI. Do not port the algorithm to Next.js API routes.** The
differentiating IP (MES ranking, gap analysis, resume parsing) is numpy-based
Python with tests. Rewriting it in TypeScript would duplicate the math, break the
"numerically identical" constraint the What-if slider relies on, and discard
pytest coverage. Next API routes are used only as a thin BFF layer (NextAuth
endpoints, affiliate-click logging), never for the domain.

```
                        +-------------------------------------------+
   Browser              |             Next.js (Vercel)              |
 +---------+            |                                           |
 | React   |  RSC fetch |  +----------------+   +---------------+   |
 | + What- |<---------->|  | Server         |   | /api/auth/*   |   |
 | if slider|  (cached) |  | Components     |   | (NextAuth)    |   |
 | (local  |            |  | reference data |   | OAuth + Creds |   |
 |  MES)   |            |  +----------------+   +-------+-------+   |
 +----+----+            |  +----------------+           | issues   |
      | React Query     |  | Client comps   |           | signed   |
      | (authed data)   |  | useSession +   |           v JWT      |
      |                 |  | React Query    |    session cookie     |
      +-----------------+->+-------+--------+                       |
                        +---------+-----------------------------+---+
                                  | fetch w/ Authorization: Bearer <JWT>
                                  v
                        +-------------------------------------------+
                        |          FastAPI (container/Cloud Run)    |
                        |  JWT-validation dependency (resource      |
                        |  server; trusts NextAuth-issued tokens)   |
                        |  routers/   core/algorithm.py (MES)       |
                        |  SQLModel + Alembic                       |
                        +-------------------+-----------------------+
                                            |
                          +-----------------+-----------------+
                          v                                   v
                  +---------------+                  +----------------+
                  |  PostgreSQL   |                  | Object storage |
                  | (Neon/Supabase|                  | (transcripts,  |
                  |  /RDS)        |                  |  CARIA reports)|
                  +---------------+                  +----------------+
        OAuth providers (Google / Facebook) --> NextAuth
```

## 2. Database: PostgreSQL, owned by the Python tier

**Use PostgreSQL** (managed: Neon, Supabase, or RDS). JSONB for competency
vectors and score maps, relational integrity for users -> results -> leads, and
aggregation for admin analytics. SQLite (`leads.sqlite3`) will not take
concurrent writes or analytics load.

**ORM ownership rule.** Prisma/Drizzle are TypeScript ORMs; the data and
algorithm live in Python. Running Prisma on the Next side over tables FastAPI
also owns creates a two-headed-ORM problem (two migration histories, schema
drift). **One owner: SQLModel (SQLAlchemy) + Alembic in FastAPI as the system of
record.** Keep NextAuth on a stateless JWT session so it needs no DB adapter and
therefore no Prisma. Drizzle on the Next side is justified only if we later adopt
NextAuth's DB adapter, and then it owns only `Account`/`Session`.

The schema below is in Prisma syntax for readability; it maps 1:1 to SQLModel.

```prisma
// ---------- Identity ----------
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  image       String?
  provider    String   // "google" | "facebook" | "credentials"
  role        Role     @default(GUEST)
  studentId   String?  @unique   // SUT Student ID, only for credentials users
  program     String?            // "DT" | "DM" ...
  year        Int?
  gpa         Float?
  createdAt   DateTime @default(now())
  results     AssessmentResult[]
  leads       Lead[]
}
enum Role { GUEST STUDENT ADMIN }

// ---------- Reference data (today: careers.json / competencies.json / courses.json) ----------
model Competency {
  id        String  @id           // "S20_Programming"
  domain    String                // "skill" | "attitude" | "knowledge"
  labelEn   String
  labelTh   String
  courses   CompetencyCourse[]
}

model Career {
  careerId   String @id           // "DT08"
  name       String
  group      String               // "Software" | "Data_AI" ...
  program    String               // "DT" | "DM"
  vector     Json                 // JSONB CompetencyScores — hot path for MES load
  demands    CompanyDemand[]
}

model Course {
  courseId     String @id         // "C001"
  title        String
  provider     String             // "xLane SUT"
  priceThb     Int
  durationHours Int
  level        String?
  url          String
  affiliate    Boolean
  thumbnailUrl String?
  competencies CompetencyCourse[]
}
model CompetencyCourse {           // which course closes which gap
  competencyId String
  courseId     String
  competency   Competency @relation(fields: [competencyId], references: [id])
  course       Course     @relation(fields: [courseId], references: [courseId])
  @@id([competencyId, courseId])
}

// ---------- Per-user results (today: localStorage caria_top10 / user_custom_scores) ----------
model AssessmentResult {
  id               String   @id @default(cuid())
  userId           String?              // NULL = guest; claimed on login
  anonId           String?  @unique     // cookie id for guest claiming
  program          String
  year             Int?
  gpa              Float?
  scores           Json                 // JSONB CompetencyScores (raw input)
  inputMethod      String?
  dreamCareerGroup String?
  dreamCareerId    String?
  top10            Json                 // snapshot of CareerResult[] at compute time
  createdAt        DateTime @default(now())
  user             User?    @relation(fields: [userId], references: [id])
  @@index([userId])
}

// ---------- B2B / admin (today: adminStats.ts, IndustryDemand, CompanyDirectory) ----------
model CompanyDemand {
  id           String   @id @default(cuid())
  companyName  String
  careerId     String
  openings     Int
  region       String?
  sourceUrl    String?
  snapshotDate DateTime
  career       Career   @relation(fields: [careerId], references: [careerId])
  @@index([careerId, snapshotDate])
}

model FacultyGapSnapshot {           // curriculum-planning output (TOP_GAPS + module forecast)
  id                     String   @id @default(cuid())
  academicYear           Int
  competencyId           String
  avgGap                 Float
  studentsBelowThreshold Int
  moduleId               String?
  nextTermForecast       Int?
  trend                  String?  // "up" | "down"
  computedAt             DateTime @default(now())
  @@index([academicYear])
}

// ---------- Lead-gen / Fast-Track (today: leads.sqlite3 + admissions_store.py) ----------
model Lead {
  leadId            String   @id @default(cuid())
  userId            String?
  targetTrack       String
  mesScore          Float
  transcriptUrl     String?
  cariaReportUrl    String?
  status            String   @default("received")
  createdAt         DateTime @default(now())
  user              User?    @relation(fields: [userId], references: [id])
}
```

Modeling notes:
- `Career.vector` stays **JSONB**, not a normalized join: the MES engine loads all
  ~78 vectors at once; a join there is slower for no gain. The normalized
  `Competency` table still holds labels/domains.
- `FacultyGapSnapshot` is **derived**: `TOP_GAPS` and `MODULE_DEMAND_FORECAST` are
  aggregations over `AssessmentResult`, recomputed by a nightly job.

## 3. Authentication: NextAuth as identity boundary, FastAPI as resource server

Today's mock auth is two separate concepts; keep them separate:

| Today (mock) | Becomes |
|---|---|
| `useMockAuth.ts` -> gateway role (`student`/`guest`) in `localStorage` | a `role` **claim inside the NextAuth JWT** |
| `mock-auth.ts` -> mocked Google/Facebook user in `localStorage` | real NextAuth **OAuth** sign-in |
| `RouteGuard.tsx` -> client redirect on missing role | `middleware.ts` + server `auth()` guard |
| `mockLogin()` "TODO: upload local results" | the **guest -> user claim** step, for real |

**Design.** NextAuth owns login; FastAPI never sees passwords. NextAuth issues a
signed JWT (JWT session strategy) carrying `sub`, `role`, `studentId`, `program`.
The Next client sends it as `Authorization: Bearer <jwt>` to FastAPI, which
validates it in a dependency (shared `AUTH_SECRET`, or JWKS later). On first
authenticated call, FastAPI **upserts the `User` row** from the claims, so
identity is born on the Next side but persisted by the one ORM owner.

**Providers.**
- **Google + Facebook**: OAuth providers for the public "Guest" funnel; `role: GUEST`.
- **SUT Student ID**: a **Credentials** provider whose `authorize()` calls
  `POST /api/v1/auth/verify-student` on FastAPI (checks the ID against an SUT list
  or seeded `User` table). Verified -> `role: STUDENT`, `studentId` set.

**Guest -> user claim flow** (what `mock-auth.ts` already promises): guests get an
`anonId` cookie; their `AssessmentResult` is stored with `anonId` and
`userId: null`. On first login, the Next `signIn` callback calls
`POST /api/v1/results/claim { anonId }`, and FastAPI re-keys those rows to the new
`userId`. No result is lost when an anonymous user signs in.

**Authorization.** Route protection moves from client `RouteGuard` to Next
`middleware.ts`, and **FastAPI re-checks role on every protected endpoint**
(`/admin/*` requires `ADMIN`). The client guard is UX, not security.

## 4. State & data fetching

Split by mutability and ownership. No Redux/Zustand; there is no global client
state that warrants it.

- **(a) Reference data -> React Server Components + cached `fetch`.**
  `careers-list.ts`, `competencies.ts`, `adminStats.ts`, and the static parts of
  `mockData.ts` are read-mostly and identical for everyone. Fetch in Server
  Components with `fetch(url, { next: { revalidate: 3600 } })`. No client JS for
  the data layer; edge-cached.
- **(b) Authenticated, mutable data -> TanStack Query (React Query).** Wrap the
  existing `api.ts` functions in hooks (`useSubmitAssessment` mutation,
  `useRecommendations`/`useGapAnalysis` queries). Caching, retries, loading/error
  states, optimistic updates, same response types.
- **(c) Keep the What-if slider local.** `mes-client.ts` recomputes at slider
  speed in-browser; that stays. React Query handles initial vector load and the
  persisted submit; the slider never hits the network.
- **(d) Kill the silent mock fallback.** `api.ts` currently returns `MOCK_TOP10`
  on network error, which hides real outages. Gate behind `NEXT_PUBLIC_USE_MOCKS`,
  default off in production, so failures surface as real error states.

## 5. Execution: four phases, contract held constant

Governing rule: **the response shapes in `types/index.ts` never change.** Each
phase swaps an implementation behind that seam.

### Phase 1 - Persistence (Postgres + SQLModel/Alembic)
- [x] Add `sqlmodel`, `alembic`, `psycopg` to `backend/requirements.txt` (`python-jose` deferred to Phase 2). `sqlmodel`/`alembic` installed locally.
- [x] Translate schema to SQLModel models (`models/orm.py`, snake_case to match the API contract); lazy engine (`models/db_session.py`); Alembic scaffold under `backend/migrations/`.
- [x] Initial migration `migrations/versions/8d9b5ad079b9_initial_schema.py` (dialect-neutral; verified upgrade+downgrade round-trip on SQLite).
- [x] Seeder `data/seed_db.py` importing `careers.json`, `competencies.json`, `courses.json` and migrating `leads.sqlite3`; proven end-to-end (66 competencies / 78 careers / 126 courses / 126 links).
- [x] Repoint data access to the DB at the seam (`models/database.py`), env-gated by `DATABASE_URL`: careers from the `career` table, assessments persisted in `assessment_result` (keyed by `anon_id` pre-auth). **No router files changed; response shapes frozen.**
- [x] `pytest` still green on the default path (17 passed; `DATABASE_URL` unset → JSON/in-memory, byte-identical).
- [x] Full flow verified DB-backed via `TestClient` on local SQLite: submit → persist → recommendations → gap-analysis → simulate, plus startup persona seed + lazy compute.
- [ ] Provision **managed Postgres**; point `DATABASE_URL` at it, `alembic upgrade head` + `python -m data.seed_db`. **(needs a Postgres URL; the migration is dialect-neutral and ready)**
- [x] UI untouched; mock fallback in `frontend/src/lib/api.ts` still on.

**Run DB-backed locally:**
```
cd backend
export DATABASE_URL="sqlite:///./data/caria_dev.db"   # already built + seeded (gitignored)
uvicorn main:app --reload
```
Unset `DATABASE_URL` to fall back to the original JSON/in-memory prototype.

> Gotchas found during validation: (1) `from __future__ import annotations` breaks
> SQLModel `Relationship()` resolution, so it's omitted from `orm.py`; (2) the
> migrations dir must not be named `alembic/` (it shadows the installed package),
> hence `migrations/`. Set `DATABASE_URL` via `backend/.env` (see `.env.example`).
>
> Phase 1 boundary: the canonical 66 competency keys/labels and the course catalog
> are still read from JSON by `core/algorithm.py` and `core/gap_analyzer.py` (static
> reference data, identical either way); the admissions Fast-Track lead store still
> uses its own `leads.sqlite3` (the `lead` table + `seed_db` migration path exist
> for when it moves). Both are clean follow-ons, not blockers.

### Phase 2 - Authentication (NextAuth + FastAPI resource server)
- [x] FastAPI JWT-validation dependencies (`core/auth.py`): `get_optional_user` / `get_current_user` / `require_role`, HS256 against shared `AUTH_SECRET`; accepts snake_case and NextAuth camelCase claims.
- [x] `POST /api/v1/auth/verify-student` (SUT-ID check; stub format, swap for real registry), `GET /api/v1/auth/me` (upserts User on first authed call), `POST /api/v1/results/claim` (guest→user re-key). Registered in `main.py`.
- [x] User upsert + `claim_assessments` in `models/database.py`; verified end-to-end on SQLite (401 unauth → verify → token → `/me` upsert → guest submit → claim re-keys the row).
- [x] Default path unaffected: existing endpoints stay open (guest-friendly), app imports with no `AUTH_SECRET`, 17 tests still green.
- [x] **Frontend NextAuth installed + configured** (`next-auth@5.0.0-beta.31` via pnpm). `src/auth.ts` (Auth.js v5): SUT-ID **Credentials** provider calling `verify-student`; Google/Facebook providers auto-added only when their env creds exist; JWT session carrying `role`/`studentId`/`program` + the FastAPI `backendToken`. `app/api/auth/[...nextauth]/route.ts` handler. **`pnpm build` passes (14 routes, `/api/auth/[...nextauth]` live).** Additive — existing components/`useMockAuth` untouched, UI unchanged.
- [x] `SessionProvider` wired into `layout.tsx` (`components/auth-session-provider.tsx`) and a working **`/signin` page** (SUT-ID form → `signIn("sut-student")`; OAuth buttons rendered only for configured providers via `getProviders()`; signed-in state with sign-out). Additive; `pnpm build` passes (15 routes). Dev `AUTH_SECRET` set in gitignored `frontend/.env.local`.
- [x] **Mock-auth UI integrated, "login optional" model** (per chosen design): `RouteGuard` now passes on a NextAuth session OR the gateway role (guests unchanged, logged-in users never bounced) via a `bypass` flag added to `useMockAuth`; `site-header` shows a Sign in link / the user + sign-out; `api.ts` attaches `session.backendToken` as `Authorization: Bearer` when present (guests stay anonymous).
- [x] **Runtime-verified end-to-end** (headless, via cookie-jar HTTP): SUT-ID login → callback → session carries `role`/`backendToken` → that token authenticates against FastAPI `/me`. Caught + fixed a real deploy bug: Auth.js v5 needs `trustHost: true` for non-Vercel / `next start` (else `UntrustedHost`).
- [x] Guest→user wiring in the UI: stable per-browser `anonId` (`lib/anon-id.ts`) used as the assessment submit key; `ClaimOnSignIn` (mounted under `SessionProvider`) calls `api.claimResults(anonId)` → `/results/claim` on first authenticated render. Build-verified; the `claim` endpoint itself is runtime-tested.
- [ ] Retire the leftover mock login (`auth/AuthButtons.tsx`, `lib/mock-auth.ts`) once the new flow is adopted; today they coexist harmlessly.
- [ ] **OAuth** (needs Google/Facebook client id+secret): set env creds; add a FastAPI `/auth/exchange` so OAuth users also get a backend `backendToken` (wired in the `jwt` callback).
- [ ] Real SUT Student-ID verification (replace the format-only stub in `routers/auth.py`).
- [ ] Deploy: set `AUTH_TRUST_HOST=true` (or keep `trustHost: true`) on the self-hosted Next server; set frontend `AUTH_SECRET`.

> Token design note: the frontend and backend `AUTH_SECRET` do **not** need to
> match. The backend mints + validates its own HS256 `backendToken` (returned by
> `verify-student`, carried inside the NextAuth session); the frontend secret only
> signs NextAuth's own session cookie.

### Phase 3 - Data-fetching migration (kill hardcoded arrays)
- [x] Backend reference endpoints `GET /api/v1/careers`, `/api/v1/competencies`, `/api/v1/admin/stats` (`routers/reference.py`, shapes match the frontend constants; careers omit the heavy vector). Tested via TestClient.
- [x] Env-gate the silent mock fallback in `api.ts` (`NEXT_PUBLIC_USE_MOCKS`; defaults: on in dev, **off in production** so real failures surface). Build-verified.
- [x] Assessments persist server-side via `assessment_result` (Phase 1); `localStorage` (`caria_top10`/`user_custom_scores`) now only passes values between pages.
- [ ] Convert the reference-data consumers (`careers-list.ts`, `competencies.ts`, `adminStats.ts`, static `mockData`) to RSC `fetch`/React Query against the new endpoints, then delete the static arrays. (The larger component refactor; needs loading/error/empty states + browser verification.)
- [x] React Query installed + wired: `QueryProvider` in `layout.tsx`, typed hooks (`useRecommendations`/`useGapAnalysis`/`useSubmitAssessment`) in `hooks/use-api.ts` wrapping `api.ts`. Build-verified; adoption by components is incremental (same response types).
- [x] **Proof of adoption:** `career/[id]` migrated to `useGapAnalysis` (replaces manual `useEffect`+`useState`+mock fallback) with real loading + error/retry states. Build-verified; needs a browser click-through to confirm rendering.
- [x] `marketplace`, `CurriculumTrackFunnel`, `use-caria-report` migrated to `useGapAnalysis` (career was the first). Four consumers now on React Query with loading/error handling. Build-verified.
- [x] `analytics/page.tsx` (`PersonalInsights`) migrated to `useGapAnalysis` — **all `getGapAnalysis` consumers now on React Query** (career, marketplace, CurriculumTrackFunnel, use-caria-report, analytics). localStorage handoff kept for the result; build-verified (browser click-through still recommended).
- [ ] Dashboard: **caveat** — its results come from the `localStorage` handoff (`caria_top10`), not `getRecommendations`, so it needs reworking the handoff (or persisting/reading results via the API), not a drop-in hook swap. Browser verification required.
- [ ] Migrate reference-data consumers (`careers-list`, `competencies`, `adminStats`) to RSC fetch against the new endpoints; delete the static arrays.

### Phase 4 - Production hardening & deploy
- [x] Backend `Dockerfile` + root `docker-compose.yml` (FastAPI + Postgres 16, healthcheck, migrate+seed on start). `docker compose config` validates. **Not yet run** — the Docker daemon isn't started in this env (`compose up` needs Docker Desktop running).
- [ ] Topology: Next on Vercel; FastAPI container (Cloud Run/Fly/Render); managed Postgres; object storage for transcripts and generated CARIA reports.
- [x] Rate limiting (`slowapi`, `core/ratelimit.py`): `assessment/submit` 20/min, `verify-student` 10/min, keyed by client IP. Verified (10×200 then clean 429, not 500); 17 tests still green. Swap in-memory for Redis storage behind multiple workers.
- [x] CORS now env-driven (`CORS_ORIGINS` comma-separated + `CORS_ORIGIN_REGEX`; localhost default) and basic structured logging (`LOG_LEVEL`). Documented in `.env.example`; import + 17 tests verified.
- [ ] Secrets management in the deploy env (`AUTH_SECRET`, OAuth creds, `DATABASE_URL`); Sentry DSN for error tracking.
- [x] Faculty-gap aggregation (`core.aggregate`): computes per-competency `FacultyGapSnapshot` from `assessment_result` (target = dream career, else top MES match), served by `GET /api/v1/admin/faculty-gaps`. Verified on dev DB (3 assessments → 44 snapshots); graceful empty with no DB. Run on a schedule for the nightly job.
- [ ] Extend to module-demand forecasts; wire `/admin/stats` to computed data (still `stats_mock.json`).
- [x] CI workflow (`.github/workflows/ci.yml`): backend `pytest` + frontend `next build` (type-checks) on push/PR. Both commands verified passing locally. (`next lint` omitted until an ESLint config is committed — it currently prompts interactively.)
- [x] Backend test coverage expanded 17 → **29**: aggregation, reference/admin endpoints, auth, and **DB-backed integration** (persistence, `/me` upsert, guest→user claim — isolated temp-SQLite fixture). Files: `test_aggregate.py`, `test_reference.py`, `test_auth.py`, `test_db_flow.py`. All green.
- [x] Frontend test harness: **Vitest + Testing Library (jsdom)**, `pnpm test`, wired into CI. **14 tests**: `/signin` component, session-aware `site-header`, `RouteGuard` (login-optional: session OR gateway role), `api` auth-header (Bearer when signed in, none for guests), `mes-client` (Eq.1/Eq.2/ranking — pins the IP that must match the backend), and `getAnonId`. Test files excluded from `tsconfig` so `next build` stays clean.

> **Verification tally:** backend 29 pytest + frontend 14 Vitest = 43 automated tests, all green; both run in CI. Plus the runtime-verified auth login chain and DB flow.
- [ ] Add Alembic `upgrade head` to the deploy step; Postgres backups; commit an ESLint config so lint can join CI.

---

_Net: roughly 40% done. The hard part (the algorithm and a typed contract) exists.
The transition is mostly storage, identity, and removing demo crutches. The single
most important discipline is freezing `types/index.ts` and the endpoint shapes so
the UI rides through all four phases untouched._
