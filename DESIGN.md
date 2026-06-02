# Design System

Design reference for CARIA-GAP (SUT advisory & curriculum platform). Companion to `PRODUCT.md`.

## Register & stance

- **Product** register for authenticated/app surfaces (dashboard, analytics, B2B portal, assessment): design serves the task, earned familiarity, consistent component vocabulary.
- **Brand** register for the marketing landing page (`/`): higher-impact, WOW visuals.
- **Dark mode is the default** (`defaultTheme="dark"`, `enableSystem={false}`). Every surface must read in both themes.
- **Bilingual TH/EN** via `useLanguage()` (`lang`, `t`). Thai text uses the `font-thai` utility (IBM Plex Sans Thai, relaxed line-height to clear tone marks).

## Foundations

### Type
- **Display:** Syne (`font-syne`) — headings, numbers, brand moments. Loaded via `next/font/google` in `layout.tsx`.
- **Body / UI:** Geist Sans (`font-sans`, default) — loaded via the `geist` package.
- **Mono / codes:** Geist Mono (`font-mono`) — competency codes, figures (`tabular-nums`).
- **Thai:** IBM Plex Sans Thai (`font-thai`).
- All three font families are wired through `globals.css` `@theme inline` tokens (`--font-syne`, `--font-sans`, `--font-mono`).

### Color (tokens in `globals.css`)
- **SUT Orange** `--brand-orange #F39200` (primary action) on dark ink foreground `#1a1100`.
- **SUT Navy** `--brand-blue #002F6C` (secondary).
- Semantic tokens: `background`, `card`, `muted`, `border`, `foreground`, `muted-foreground`, `success`, `danger`, themed for light and dark.
- **Accent-on-tint pattern:** vivid color as text/icon over its own ~10% tint (`${hex}1a`). For solid-accent fills carrying text, use a luminance-based readable foreground (`readableOn()` in `lib/sut-tracks.ts`) so bright accents get dark ink, not white.

### Motion
- 150–250 ms on most product transitions; motion conveys state, not decoration.
- **`prefers-reduced-motion` is respected** across interactive motion (marquee, glow, card 3D tilt, radar tilt, reveals).

### Recurring patterns
- Glassmorphism cards (`bg-card/50 dark:bg-card/30 backdrop-blur-md border border-border/60 rounded-2xl`).
- Circular match-fit progress rings (CareerCard).
- Recharts radar for competency drill-down (student vs. role).
- Pill chips for tags (track, competency, program), `focus-visible` rings on actions.

## Feature: B2B SUT Curriculum Track funnel — fully implemented

Routes each matched career into the SUT program that owns it. The university (SUT) is the B2B customer; the matched student is the lead. Lives on the student dashboard, built additively (the existing top-10 / dream-career flow is untouched).

- **B2B Lead-Gen Funnel — implemented.** Every recommended career is tagged with a high-level **SUT Curriculum Track** (e.g. Data Science & AI, Software Engineering, Creative & Visual Media). A drill-down detail view (`CurriculumTrackFunnel`, "Screen 2") ends in a single track CTA that routes the student into that track's pathway. Career→track mapping and faculty-level **upskill programs/bootcamps** (no individual course codes) live in `lib/sut-tracks.ts`.
- **Track Readiness Badge — implemented.** Derived from the **MES score** (`raw_mes`, falling back to `match_percentage`) into four tiers: Track Ready (≥85), Track Aligned (≥70), Foundational (≥55), Exploratory. Each tier carries a color, label (TH/EN), and guidance blurb.
- **Additive Dashboard — implemented.** `DrilldownRadar` (reusable, reduced-motion aware) and `CurriculumTrackFunnel` are mounted into `app/dashboard/page.tsx`; `CareerCard` gained an optional `track` chip prop (no change when unused).

### Key files
- `lib/sut-tracks.ts` — tracks, MES→readiness tiers, faculty programs, `readableOn()`.
- `components/dashboard/DrilldownRadar.tsx` — reusable competency radar.
- `components/dashboard/CurriculumTrackFunnel.tsx` — drill-down detail (Screen 2).
- `app/dashboard/page.tsx` — funnel mount + track-tagged cards.
- `components/results/CareerCard.tsx` — optional track chip.

### Status
Merged to `main` via PR #3 (`3623a26`). `pnpm build` passes (11/11 routes); all touched files diagnostics-clean; contrast and Tailwind-class issues resolved in a polish pass.
