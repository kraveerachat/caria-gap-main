/**
 * CARIA-GAP What-If Simulator — competency calibration lab.
 *
 * Binds sliders to the real 66 CARIA competencies (Skills / Knowledge /
 * Attitudes, e.g. S20_Programming, K05_Computers_and_Electronics), grouped and
 * searchable. Every adjustment re-runs the Modified Euclidean Similarity (Eq.1
 * capping + Eq.2 MES from lib/mes-client) across all 78 career vectors and
 * instantly re-ranks the Top Careers list and the Top-3 hiring-company match.
 */
"use client";

import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect, useId, useMemo, useCallback, memo } from "react";
import { useLanguage } from "@/components/language-provider";
import {
  COMPETENCIES,
  DOMAIN_META,
  competencyLabel,
  type CompetencyDomain,
} from "@/lib/competencies";
import { recomputeRanking } from "@/lib/mes-client";
import baselineScores from "@/lib/simulator-baseline.json";
import careerVectors from "@/lib/career-vectors.json";
import type { CareerVector, CompetencyScores } from "@/types";
import {
  Search,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Activity,
  BrainCircuit,
  Sparkles,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

const CAREERS = careerVectors as unknown as CareerVector[];
const BASELINE = baselineScores as CompetencyScores;

/* ------------------------------------------------------------------ */
/*  Hiring partners — required competency ids per company               */
/* ------------------------------------------------------------------ */
interface Company {
  name: string;
  sectorTh: string;
  sectorEn: string;
  req: string[];
}
const COMPANIES: Company[] = [
  { name: "Agoda", sectorTh: "ทราเวลเทค", sectorEn: "Travel Tech", req: ["S20_Programming", "K05_Computers_and_Electronics", "S25_Systems_Analysis"] },
  { name: "KBTG", sectorTh: "ฟินเทค (กสิกร)", sectorEn: "FinTech (KASIKORN)", req: ["S20_Programming", "S26_Systems_Design", "S03_Complex_Problem_Solving"] },
  { name: "SCB Tech X", sectorTh: "แบงก์กิ้งเทค", sectorEn: "Banking Tech", req: ["S25_Systems_Analysis", "S26_Systems_Design", "K10_Engineering_and_Technology"] },
  { name: "LINE MAN Wongnai", sectorTh: "แพลตฟอร์ม", sectorEn: "Platform", req: ["S20_Programming", "K05_Computers_and_Electronics", "S22_Planning"] },
  { name: "Sertis", sectorTh: "AI / Data", sectorEn: "AI / Data", req: ["S14_Mathematics", "S03_Complex_Problem_Solving", "K17_Mathematics"] },
  { name: "Bitkub", sectorTh: "บล็อกเชน", sectorEn: "Blockchain", req: ["S20_Programming", "K28_Telecommunications", "S28_Troubleshooting"] },
  { name: "Thoughtworks", sectorTh: "ซอฟต์แวร์", sectorEn: "Software", req: ["S20_Programming", "S26_Systems_Design", "S05_Critical_Thinking"] },
  { name: "Bluebik", sectorTh: "ที่ปรึกษาดิจิทัล", sectorEn: "Digital Consulting", req: ["S25_Systems_Analysis", "S10_Judgment_and_Decision_Making", "K26_Sales_and_Marketing"] },
];

const STRONG = 70; // a competency at/above this counts as a met requirement

/* ------------------------------------------------------------------ */
/*  Animated number ticker                                              */
/* ------------------------------------------------------------------ */
function useNumberTicker(value: number, reduce: boolean | null, duration = 0.4) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (reduce) {
      prev.current = value;
      setDisplay(value);
      return;
    }
    const start = prev.current;
    prev.current = value;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const e = (now - t0) / (duration * 1000);
      if (e < 1) {
        setDisplay(Math.round(start + (value - start) * (1 - Math.pow(1 - e, 3))));
        raf = requestAnimationFrame(tick);
      } else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);
  return display;
}

/* ================================================================== */
/*  Accessible custom slider                                           */
/* ================================================================== */
function NeuralSlider({
  value,
  baseline,
  onChange,
  ariaLabel,
  color,
}: {
  value: number;
  baseline: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  color: string;
}) {
  const id = useId();
  const pct = Math.max(0, Math.min(100, value));
  const delta = value - baseline;

  return (
    <div className="relative">
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
      />
      <div className="relative h-1.5 rounded-full bg-slate-200/80 dark:bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-slate-400/70 dark:bg-white/30"
          style={{ left: `${baseline}%` }}
          title={`Baseline ${baseline}`}
        />
        <span
          aria-hidden
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-sm transition-[left] duration-100 ease-out dark:bg-slate-100"
          style={{ left: `${pct}%`, borderColor: color }}
        />
        {delta !== 0 && (
          <span
            className={`pointer-events-none absolute -top-6 z-10 inline-flex -translate-x-1/2 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums ${
              delta > 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-500"
            }`}
            style={{ left: `${pct}%` }}
          >
            {delta > 0 ? <ArrowUp className="size-2" strokeWidth={3} /> : <ArrowDown className="size-2" strokeWidth={3} />}
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Competency row (memoized so only the dragged row re-renders)       */
/* ================================================================== */
const CompetencyRow = memo(function CompetencyRow({
  id,
  domain,
  value,
  baseline,
  thai,
  onChange,
}: {
  id: string;
  domain: CompetencyDomain;
  value: number;
  baseline: number;
  thai: boolean;
  onChange: (id: string, n: number) => void;
}) {
  const meta = DOMAIN_META[domain];
  const changed = value !== baseline;
  return (
    <li className="py-2.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full" style={{ background: meta.color }} aria-hidden />
          <span className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            {competencyLabel(id, thai)}
          </span>
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {id.split("_")[0]}
          </span>
        </div>
        <span
          className={`shrink-0 font-mono text-sm font-bold tabular-nums ${changed ? "text-brand-orange" : "text-slate-700 dark:text-slate-300"}`}
        >
          {value}
        </span>
      </div>
      <NeuralSlider
        value={value}
        baseline={baseline}
        onChange={(n) => onChange(id, n)}
        ariaLabel={`${meta.labelEn}: ${competencyLabel(id, false)}`}
        color={meta.color}
      />
    </li>
  );
});

/* ================================================================== */
/*  Live ranked career card                                            */
/* ================================================================== */
const RANK_COLORS = ["#F39200", "#1E90FF", "#A78BFA", "#34D399", "#EC4899"];

function MatchCard({
  rank,
  title,
  match,
  delta,
  rankChanged,
  reduce,
}: {
  rank: number;
  title: string;
  match: number;
  delta: number;
  rankChanged: boolean;
  reduce: boolean | null;
}) {
  const color = RANK_COLORS[rank - 1] || "#94a3b8";
  const shown = useNumberTicker(match, reduce);
  return (
    <motion.div
      layout={!reduce}
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow:
          rankChanged && !reduce
            ? `0 0 0 1px ${color}, 0 0 22px ${color}66`
            : rank === 1
              ? `0 0 0 1px ${color}44`
              : "0 0 0 0 transparent",
      }}
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 }, boxShadow: { duration: 0.8 } }}
      className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 dark:border-white/10 dark:bg-white/4"
    >
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold tabular-nums"
        style={{ background: `${color}1f`, color }}
      >
        {rank}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 dark:text-white">{title}</span>
      {delta !== 0 && (
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums ${
            delta > 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-500"
          }`}
        >
          {delta > 0 ? <ArrowUp className="size-2" strokeWidth={3} /> : <ArrowDown className="size-2" strokeWidth={3} />}
          {Math.abs(delta).toFixed(1)}
        </span>
      )}
      <span className="shrink-0 font-mono text-lg font-extrabold tabular-nums" style={{ color }}>
        {shown}
        <span className="text-xs">%</span>
      </span>
    </motion.div>
  );
}

/* ================================================================== */
/*  Section                                                            */
/* ================================================================== */
export default function SimulatorSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t, lang } = useLanguage();
  const thai = lang === "th";
  const reduce = useReducedMotion();

  const [scores, setScores] = useState<CompetencyScores>({ ...BASELINE });
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<"all" | CompetencyDomain>("all");
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({});

  const updateScore = useCallback((id: string, value: number) => {
    setScores((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Filtered competency list for the control panel.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPETENCIES.filter((c) => {
      if (domain !== "all" && c.domain !== domain) return false;
      if (!q) return true;
      return (
        c.label_en.toLowerCase().includes(q) ||
        c.label_th.includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    });
  }, [query, domain]);

  // Real MES re-ranking across all 78 careers.
  const ranked = useMemo(() => recomputeRanking(scores, CAREERS).slice(0, 5), [scores]);

  // Track rank changes for the glow.
  const rankKey = ranked.map((r) => `${r.career_id}:${r.match_percentage}`).join("|");
  useEffect(() => {
    const next: Record<string, number> = {};
    ranked.forEach((r, i) => (next[r.career_id] = i + 1));
    const changed = Object.keys(next).some((id) => previousRanks[id] !== undefined && previousRanks[id] !== next[id]);
    if (changed || Object.keys(previousRanks).length === 0) setPreviousRanks(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankKey]);

  // Baseline match per career (to show delta vs the starting profile).
  const baselineMatch = useMemo(() => {
    const m: Record<string, number> = {};
    recomputeRanking(BASELINE, CAREERS).forEach((r) => (m[r.career_id] = r.match_percentage));
    return m;
  }, []);

  // Top-3 hiring-company match, driven by the student's current strengths.
  const companies = useMemo(() => {
    return COMPANIES.map((c) => {
      const vals = c.req.map((id) => scores[id] ?? 0);
      const score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      return { ...c, score, met: c.req.filter((id) => (scores[id] ?? 0) >= STRONG).length };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [scores]);

  // Dynamic insight: the biggest unmet requirement for the #1 ranked career.
  const insight = useMemo(() => {
    const top = ranked[0];
    if (!top) return null;
    const vec = CAREERS.find((c) => c.career_id === top.career_id)?.competency_vector;
    if (!vec) return null;
    let best: { id: string; gap: number } | null = null;
    for (const [id, req] of Object.entries(vec)) {
      const gap = req - (scores[id] ?? 0);
      if (!best || gap > best.gap) best = { id, gap };
    }
    if (!best || best.gap <= 2) return { career: top.career_name, id: null as string | null, gap: 0 };
    return { career: top.career_name, id: best.id, gap: Math.round(best.gap) };
  }, [ranked, scores]);

  const dirty = useMemo(() => COMPETENCIES.some((c) => scores[c.id] !== BASELINE[c.id]), [scores]);
  const changedCount = useMemo(() => COMPETENCIES.filter((c) => scores[c.id] !== BASELINE[c.id]).length, [scores]);

  const domainTabs: { id: "all" | CompetencyDomain; label: string }[] = [
    { id: "all", label: thai ? "ทั้งหมด" : "All" },
    { id: "skill", label: thai ? "ทักษะ" : "Skills" },
    { id: "knowledge", label: thai ? "ความรู้" : "Knowledge" },
    { id: "attitude", label: thai ? "ทัศนคติ" : "Attitudes" },
  ];

  return (
    <section id="simulator" className="relative isolate overflow-hidden bg-slate-50 py-24 dark:bg-[#050A14] md:py-32">
      {/* Backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(243,146,0,0.07),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(243,146,0,0.14),_transparent_55%)]" />
        <div className="absolute -left-40 top-1/4 size-[420px] rounded-full bg-[#F39200]/8 blur-[130px]" />
        <div className="absolute -right-40 bottom-1/4 size-[420px] rounded-full bg-[#1E90FF]/8 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F39200]/30 bg-[#F39200]/10 px-4 py-1.5">
            <SlidersHorizontal className="size-3.5 text-[#F39200]" strokeWidth={2.5} aria-hidden />
            <span className={`text-xs font-bold uppercase tracking-[0.18em] text-[#F39200] ${thai ? "font-thai" : "font-syne"}`}>
              {t.simulator.eyebrow}
            </span>
          </div>
          <h2 className={`mb-3 text-balance text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-5xl ${thai ? "font-thai leading-relaxed" : "font-syne leading-tight"}`}>
            {t.simulator.title}
          </h2>
          <p className={`mx-auto max-w-2xl text-base font-medium text-slate-600 dark:text-slate-400 ${thai ? "font-thai leading-loose" : "leading-relaxed"}`}>
            {thai
              ? "ปรับระดับสมรรถนะทั้ง 66 มิติของ CARIA แล้วดูคะแนน MES และอันดับอาชีพคำนวณใหม่ทันที"
              : "Calibrate all 66 CARIA competencies and watch the MES score and career ranking recompute in real time."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
          {/* ============ LEFT: competency calibration ============ */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 md:p-6">
            <header className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Activity className="size-5" strokeWidth={2.25} aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className={`text-base font-bold tracking-tight text-slate-900 dark:text-white ${thai ? "font-thai" : "font-syne"}`}>
                  {thai ? "ปรับระดับสมรรถนะ" : "Competency Calibration"}
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  66 dimensions · MES Eq.1 + Eq.2
                </p>
              </div>
            </header>

            {/* Toolbar */}
            <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" strokeWidth={2.25} aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={thai ? "ค้นหาสมรรถนะ เช่น Programming" : "Search competencies, e.g. Programming"}
                  aria-label={thai ? "ค้นหาสมรรถนะ" : "Search competencies"}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                />
              </div>
            </div>
            <div role="tablist" aria-label="domain" className="mb-1 flex gap-1.5">
              {domainTabs.map((d) => (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={domain === d.id}
                  onClick={() => setDomain(d.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    domain === d.id
                      ? "bg-brand-orange/15 text-brand-orange"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                  }`}
                >
                  {d.label}
                </button>
              ))}
              <span className="ml-auto self-center font-mono text-[11px] text-slate-400 dark:text-slate-500">
                {visible.length}/66
              </span>
            </div>

            {/* Scrollable competency list */}
            <ul className="max-h-[440px] divide-y divide-slate-100 overflow-y-auto pr-1.5 dark:divide-white/5">
              {visible.map((c) => (
                <CompetencyRow
                  key={c.id}
                  id={c.id}
                  domain={c.domain}
                  value={scores[c.id] ?? 0}
                  baseline={BASELINE[c.id] ?? 0}
                  thai={thai}
                  onChange={updateScore}
                />
              ))}
              {visible.length === 0 && (
                <li className="py-10 text-center text-sm text-slate-400">{thai ? "ไม่พบสมรรถนะ" : "No competencies found"}</li>
              )}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {changedCount > 0
                  ? thai ? `ปรับแล้ว ${changedCount} มิติ` : `${changedCount} adjusted`
                  : thai ? "ยังไม่ปรับค่า" : "No changes yet"}
              </span>
              <button
                type="button"
                onClick={() => setScores({ ...BASELINE })}
                disabled={!dirty}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-orange/40 hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
              >
                <RotateCcw className="size-3" strokeWidth={2.25} aria-hidden />
                {thai ? "รีเซ็ต" : "Reset"}
              </button>
            </div>
          </div>

          {/* ============ RIGHT: live MES + companies ============ */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            {/* Live ranking */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 md:p-6">
              <header className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#1E90FF]/10 text-[#1E90FF]">
                  <BrainCircuit className="size-5" strokeWidth={2.25} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-base font-bold tracking-tight text-slate-900 dark:text-white ${thai ? "font-thai" : "font-syne"}`}>
                    {thai ? "อันดับอาชีพแบบเรียลไทม์" : "Live MES Ranking"}
                  </h3>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Top 5 of 78 careers
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
                  <span className="relative flex size-1.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${reduce ? "" : "animate-ping"}`} />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">Live</span>
                </span>
              </header>

              <div className="flex flex-col gap-2.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {ranked.map((r, i) => (
                    <MatchCard
                      key={r.career_id}
                      rank={i + 1}
                      title={r.career_name}
                      match={Math.round(r.match_percentage)}
                      delta={Math.round((r.match_percentage - (baselineMatch[r.career_id] ?? r.match_percentage)) * 10) / 10}
                      rankChanged={previousRanks[r.career_id] !== undefined && previousRanks[r.career_id] !== i + 1}
                      reduce={reduce}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Dynamic insight */}
              {insight && (
                <div className="mt-4 flex gap-3 rounded-2xl border border-brand-orange/30 bg-brand-orange/5 p-4 dark:bg-brand-orange/8">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-orange" strokeWidth={2.25} aria-hidden />
                  <p className={`text-[13px] font-medium text-slate-700 dark:text-slate-200 ${thai ? "font-thai leading-relaxed" : "leading-relaxed"}`}>
                    {insight.id ? (
                      thai ? (
                        <>เพิ่ม <span className="font-bold text-slate-900 dark:text-white">{competencyLabel(insight.id, true)}</span> อีก <span className="font-bold text-brand-orange tabular-nums">{insight.gap}</span> คะแนน เพื่อดันความเข้ากันกับ <span className="font-bold">{insight.career}</span> ให้สูงขึ้น</>
                      ) : (
                        <>Raise <span className="font-bold text-slate-900 dark:text-white">{competencyLabel(insight.id, false)}</span> by <span className="font-bold text-brand-orange tabular-nums">{insight.gap}</span> to close the largest gap to <span className="font-bold">{insight.career}</span>.</>
                      )
                    ) : thai ? (
                      <>โปรไฟล์ของคุณถึงเกณฑ์ของ <span className="font-bold">{insight.career}</span> แล้ว พร้อมสมัครได้เลย</>
                    ) : (
                      <>Your profile already meets the bar for <span className="font-bold">{insight.career}</span>. You are ready to apply.</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Top-3 company match */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 md:p-6">
              <header className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#A78BFA]/12 text-[#A78BFA]">
                  <Building2 className="size-5" strokeWidth={2.25} aria-hidden />
                </div>
                <div>
                  <h3 className={`text-base font-bold tracking-tight text-slate-900 dark:text-white ${thai ? "font-thai" : "font-syne"}`}>
                    {thai ? "บริษัทที่ตรงกับคุณ (Top 3)" : "Top 3 Company Matches"}
                  </h3>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {thai ? "ตามจุดแข็งปัจจุบัน" : "By current strengths"}
                  </p>
                </div>
              </header>

              <ul className="flex flex-col gap-2.5">
                {companies.map((c, i) => (
                  <li key={c.name} className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{thai ? c.sectorTh : c.sectorEn}</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-base font-extrabold tabular-nums text-[#A78BFA]">{c.score}%</span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {c.req.map((id) => {
                        const met = (scores[id] ?? 0) >= STRONG;
                        return (
                          <span
                            key={id}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                              met
                                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                            }`}
                          >
                            {met && <CheckCircle2 className="size-3" strokeWidth={2.5} aria-hidden />}
                            {competencyLabel(id, thai)}
                          </span>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
