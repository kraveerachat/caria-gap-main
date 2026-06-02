/**
 * CARIA-GAP What-If Simulator — Premium AI Command Center
 *
 * Real-time MES re-ranking with custom Tailwind sliders, delta badges,
 * target-company match list, and a generative-AI insight callout.
 *
 * No native <input type="range"> visible in the UI: a hidden, fully
 * accessible range input drives a custom-rendered track + thumb so
 * keyboard, screen reader, and pointer all stay correct.
 */
"use client";

import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState, useEffect, useId } from "react";
import { MOCK_TOP10, MOCK_GAP_ANALYSIS } from "@/lib/mockData";
import { useLanguage } from "@/components/language-provider";
import {
  BrainCircuit,
  Sparkles,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Activity,
  Brain,
  Target,
  MessageSquare,
  Code2,
  PenTool,
  Rocket,
  ChevronRight,
  Building2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animated number ticker                                              */
/* ------------------------------------------------------------------ */
function useNumberTicker(value: number, duration = 0.4) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    prevValue.current = value;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed < 1) {
        const eased = 1 - Math.pow(1 - elapsed, 3);
        setDisplayValue(Math.round(start + (end - start) * eased));
        raf = requestAnimationFrame(tick);
      } else {
        setDisplayValue(end);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return displayValue;
}

/* ------------------------------------------------------------------ */
/*  Skill seed data                                                     */
/* ------------------------------------------------------------------ */
type SkillIcon = typeof Brain;
const SKILL_VISUALS: { Icon: SkillIcon; label: string }[] = [
  { Icon: Code2, label: "Engineering" },
  { Icon: Brain, label: "Analytical" },
  { Icon: Target, label: "Domain" },
  { Icon: MessageSquare, label: "Communication" },
  { Icon: PenTool, label: "Creative" },
];

const initialSkills = MOCK_GAP_ANALYSIS.gaps.slice(0, 5).map((g, i) => ({
  id: g.competency_id,
  label: g.competency_id.replace(/^[ASK]\d{2}_/, "").replace(/_/g, " "),
  value: g.student_score,
  originalValue: g.student_score,
  Icon: SKILL_VISUALS[i % SKILL_VISUALS.length].Icon,
  category: SKILL_VISUALS[i % SKILL_VISUALS.length].label,
}));

type Skill = (typeof initialSkills)[number];

/* ------------------------------------------------------------------ */
/*  Career targets with hiring partners                                 */
/* ------------------------------------------------------------------ */
const TARGET_COMPANIES: Record<string, string[]> = {
  default: ["Agoda", "KBTG", "LINE MAN Wongnai"],
  C01: ["Agoda", "KBTG", "Sertis"],
  C02: ["SCB Tech X", "Bitkub", "Skooldio"],
  C03: ["LINE MAN Wongnai", "Shopee TH", "Ascend Group"],
};

const careerTargets = MOCK_TOP10.top10_careers.slice(0, 3).map((c) => ({
  id: c.career_id,
  title: c.career_name,
  base: c.match_percentage,
  companies: TARGET_COMPANIES[c.career_id] ?? TARGET_COMPANIES.default,
  weights: {
    [initialSkills[0]?.id]: 0.35,
    [initialSkills[1]?.id]: 0.2,
    [initialSkills[2]?.id]: 0.15,
    [initialSkills[3]?.id]: 0.2,
    [initialSkills[4]?.id]: 0.1,
  } as Record<string, number>,
}));

type Career = (typeof careerTargets)[number];

function computeMatch(skills: Skill[], career: Career) {
  let improvement = 0;
  skills.forEach((s) => {
    const diff = Math.max(0, s.value - s.originalValue);
    const w = career.weights[s.id] || 0;
    improvement += (diff / 100) * w * 100;
  });
  return Math.min(99, Math.round(career.base + improvement));
}

/* ================================================================== */
/*  Custom Slider                                                       */
/* ================================================================== */

function NeuralSlider({
  value,
  originalValue,
  onChange,
  label,
  ariaLabel,
}: {
  value: number;
  originalValue: number;
  onChange: (next: number) => void;
  label: string;
  ariaLabel: string;
}) {
  const inputId = useId();
  const pct = Math.max(0, Math.min(100, value));
  const delta = value - originalValue;
  const showDelta = delta !== 0;

  return (
    <div className="relative">
      {/* Hidden native input — drives keyboard, ARIA, screen-reader.
         Sits invisibly across the full track so pointer events on the
         visible track still hit it. */}
      <input
        id={inputId}
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
      />

      {/* Visible track */}
      <div className="relative h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
        {/* Active fill: SUT Orange */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-[#F39200] to-[#FFB54D] shadow-[0_0_14px_rgba(243,146,0,0.55)] transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%` }}
        />
        {/* Original-value tick — anchors "you started here" */}
        <span
          aria-hidden
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-slate-400/70 dark:bg-white/30"
          style={{ left: `${originalValue}%` }}
          title={`Baseline ${originalValue}`}
        />
        {/* Thumb */}
        <span
          aria-hidden
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F39200] bg-white shadow-[0_4px_14px_rgba(243,146,0,0.55)] transition-[left] duration-150 ease-out dark:bg-slate-100"
          style={{ left: `${pct}%` }}
        />

        {/* Delta indicator badge above the thumb */}
        <AnimatePresence>
          {showDelta && (
            <motion.span
              key={delta}
              initial={{ opacity: 0, y: 4, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
              className={`pointer-events-none absolute -top-9 z-10 inline-flex -translate-x-1/2 items-center gap-0.5 rounded-full px-2 py-0.5 font-syne text-[10px] font-bold tabular-nums ${
                delta > 0
                  ? "bg-emerald-500/15 text-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)] ring-1 ring-emerald-500/40"
                  : "bg-rose-500/15 text-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.45)] ring-1 ring-rose-500/40"
              }`}
              style={{ left: `${pct}%` }}
            >
              {delta > 0 ? (
                <>
                  <ArrowUp className="size-2.5" strokeWidth={3} aria-hidden />+{delta}
                </>
              ) : (
                <>
                  <ArrowDown className="size-2.5" strokeWidth={3} aria-hidden />
                  {delta}
                </>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="sr-only">
        <label htmlFor={inputId}>{label}</label>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Match Card with rank-change glow                                    */
/* ================================================================== */

const RANK_COLORS = ["#F39200", "#1E90FF", "#A78BFA"];

function MatchCard({
  career,
  match,
  rank,
  delta,
  rankChanged,
}: {
  career: Career;
  match: number;
  rank: number;
  delta: number;
  rankChanged: boolean;
}) {
  const displayMatch = useNumberTicker(match);
  const color = RANK_COLORS[rank - 1] || "#94a3b8";
  const reduce = useReducedMotion();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: rankChanged && !reduce
          ? `0 0 0 1px ${color}, 0 0 24px ${color}80`
          : rank === 1
            ? `0 0 0 1px ${color}55, 0 14px 32px -16px ${color}66`
            : "0 0 0 0 transparent",
      }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout: { type: "spring", stiffness: 360, damping: 30 },
        boxShadow: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
        default: { type: "spring", stiffness: 380, damping: 30 },
      }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/85 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/4"
    >
      {/* Subtle corner glow keyed to rank color */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-30 blur-2xl"
        style={{ background: color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full font-syne text-xs font-bold tabular-nums"
            style={{ background: `${color}1f`, color }}
          >
            #{rank}
          </div>
          <div className="min-w-0">
            <h4 className="truncate font-syne text-sm font-bold text-slate-900 dark:text-white">
              {career.title}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Building2
                className="size-3 shrink-0 text-slate-400 dark:text-slate-500"
                strokeWidth={2.25}
                aria-hidden
              />
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                Target
              </span>
              <span className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                {career.companies.slice(0, 2).join(" · ")}
              </span>
              {career.companies.length > 2 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  +{career.companies.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <motion.span
            key={match}
            initial={{ scale: 1.18 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="font-syne text-2xl font-extrabold tabular-nums"
            style={{ color }}
          >
            {displayMatch}%
          </motion.span>
          <AnimatePresence>
            {delta > 0 && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-syne text-[9px] font-bold text-emerald-500"
              >
                <ArrowUp className="size-2.5" strokeWidth={3} aria-hidden />+{delta}%
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Match bar */}
      <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}AA, ${color})`,
            boxShadow: `0 0 10px ${color}66`,
          }}
          animate={{ width: `${match}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
        />
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Section                                                             */
/* ================================================================== */

export default function SimulatorSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({});
  const { t, lang } = useLanguage();
  const thai = lang === "th";
  const reduce = useReducedMotion();

  const updateSkill = (id: string, value: number) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  const matches = careerTargets
    .map((c) => ({ career: c, match: computeMatch(skills, c) }))
    .sort((a, b) => b.match - a.match);

  // Track rank changes for the temporary border-glow effect.
  useEffect(() => {
    const next: Record<string, number> = {};
    matches.forEach((m, i) => {
      next[m.career.id] = i + 1;
    });
    const changed = Object.keys(next).some((id) => previousRanks[id] !== undefined && previousRanks[id] !== next[id]);
    if (changed || Object.keys(previousRanks).length === 0) {
      setPreviousRanks(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches.map((m) => `${m.career.id}:${m.match}`).join("|")]);

  const levelText = (v: number) =>
    v < 30
      ? thai ? "ระดับเริ่มต้น" : "Novice"
      : v < 60
        ? thai ? "ระดับกลาง" : "Intermediate"
        : v < 80
          ? thai ? "ระดับสูง" : "Advanced"
          : thai ? "เชี่ยวชาญ" : "Expert";

  const dirty = skills.some((s) => s.value !== s.originalValue);

  return (
    <section
      id="simulator"
      className="relative isolate overflow-hidden bg-slate-50 py-24 dark:bg-[#050A14] md:py-32"
    >
      {/* Deep cinematic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft radial wash */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(243,146,0,0.08),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(243,146,0,0.18),_transparent_55%)]" />
        {/* Faint conic mesh — subtle "AI orb" feel without an image asset */}
        <div className="absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-2xl dark:opacity-30">
          <div className="size-full rounded-full bg-[conic-gradient(from_120deg_at_50%_50%,_#F39200_0%,_#1E90FF_30%,_#A78BFA_60%,_#F39200_100%)]" />
        </div>
        {/* Side glows */}
        <div className="absolute -left-40 top-1/4 size-[420px] rounded-full bg-[#F39200]/10 blur-[130px]" />
        <div className="absolute -right-40 bottom-1/4 size-[420px] rounded-full bg-[#1E90FF]/10 blur-[130px]" />
        {/* Hairline grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F39200]/30 bg-[#F39200]/10 px-4 py-1.5 backdrop-blur-xl">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F39200] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#F39200]" />
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-[0.2em] text-[#F39200] ${thai ? "font-thai" : "font-syne"}`}
            >
              {t.simulator.eyebrow}
            </span>
          </div>
          <h2
            className={`mb-4 text-balance text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-5xl ${thai ? "font-thai leading-relaxed" : "font-syne leading-tight"}`}
          >
            {t.simulator.title}
          </h2>
          <p
            className={`mx-auto max-w-2xl text-base font-medium text-slate-500 dark:text-slate-400 md:text-lg ${thai ? "font-thai leading-loose" : "leading-relaxed"}`}
          >
            {t.simulator.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
          {/* ============================================================
              LEFT PANEL — Neural Skill Controls
             ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.9 }}
            className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 md:p-8"
          >
            <header className="mb-8 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                <Activity className="size-5" strokeWidth={2.25} aria-hidden />
              </div>
              <div>
                <h3
                  className={`text-lg font-bold tracking-tight text-slate-900 dark:text-white ${thai ? "font-thai leading-relaxed" : "font-syne"}`}
                >
                  {thai ? "จำลองการปรับระดับทักษะ" : "Neural Skill Controls"}
                </h3>
                <p
                  className={`text-xs font-medium text-slate-500 dark:text-slate-400 ${thai ? "font-thai leading-relaxed" : ""}`}
                >
                  {thai ? "เลื่อนแถบเพื่อจำลองการพัฒนาทักษะ" : "Drag to simulate skill progression"}
                </p>
              </div>
            </header>

            <ul className="flex flex-col gap-7">
              {skills.map((skill) => {
                const Icon = skill.Icon;
                const changed = skill.value !== skill.originalValue;
                return (
                  <li key={skill.id}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                            changed
                              ? "bg-brand-orange/15 text-brand-orange"
                              : "bg-slate-100 text-slate-500 dark:bg-white/6 dark:text-slate-400"
                          }`}
                        >
                          <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-bold text-slate-900 dark:text-white ${thai ? "font-thai leading-relaxed" : ""}`}
                          >
                            {skill.label}
                          </p>
                          <p className="font-syne text-[10px] uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                            {skill.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 shrink-0">
                        <motion.span
                          key={skill.value}
                          initial={{ scale: reduce ? 1 : 1.25 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className={`w-10 text-right font-syne text-xl font-extrabold tabular-nums ${changed ? "text-brand-orange" : "text-slate-900 dark:text-white"}`}
                        >
                          {skill.value}
                        </motion.span>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          /100
                        </span>
                      </div>
                    </div>

                    <NeuralSlider
                      value={skill.value}
                      originalValue={skill.originalValue}
                      onChange={(v) => updateSkill(skill.id, v)}
                      label={skill.label}
                      ariaLabel={`${skill.category}: ${skill.label}`}
                    />

                    <div className="mt-3 flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      <span>0</span>
                      <span
                        className={`font-syne uppercase tracking-[0.14em] ${
                          changed ? "text-brand-orange" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {levelText(skill.value)}
                      </span>
                      <span>100</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <motion.button
              type="button"
              onClick={() => setSkills(initialSkills)}
              disabled={!dirty}
              whileHover={dirty ? { scale: 1.01 } : undefined}
              whileTap={dirty ? { scale: 0.99 } : undefined}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full border py-3 font-thai text-sm font-medium transition-all duration-300 ${
                dirty
                  ? "border-slate-200 text-slate-600 hover:border-brand-orange/40 hover:text-brand-orange dark:border-white/10 dark:text-slate-300 dark:hover:border-brand-orange/40"
                  : "cursor-not-allowed border-slate-200 text-slate-300 dark:border-white/5 dark:text-slate-600"
              }`}
            >
              <RotateCcw className="size-3.5" strokeWidth={2.25} aria-hidden />
              {thai ? "รีเซ็ตค่าเริ่มต้น" : "Reset to baseline"}
            </motion.button>
          </motion.div>

          {/* ============================================================
              RIGHT PANEL — Live MES Prediction Engine
             ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.9, delay: 0.12 }}
            className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 md:p-8 lg:sticky lg:top-24"
          >
            <header className="mb-8 flex items-center gap-3">
              <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E90FF]/10 text-[#1E90FF]">
                <BrainCircuit className="size-5" strokeWidth={2.25} aria-hidden />
                {/* Spinning low-opacity ring → suggests background AI compute */}
                <motion.span
                  aria-hidden
                  animate={reduce ? undefined : { rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
                  className="absolute -inset-1 rounded-2xl"
                >
                  <Activity className="size-full opacity-15" strokeWidth={1.25} />
                </motion.span>
              </div>
              <div className="min-w-0">
                <h3
                  className={`text-lg font-bold tracking-tight text-slate-900 dark:text-white ${thai ? "font-thai leading-relaxed" : "font-syne"}`}
                >
                  {thai ? "อันดับอาชีพแบบเรียลไทม์" : "Live MES Prediction"}
                </h3>
                <p
                  className={`text-xs font-medium text-slate-500 dark:text-slate-400 ${thai ? "font-thai leading-relaxed" : ""}`}
                >
                  {thai ? "อัปเดตทันทีเมื่อปรับระดับทักษะ" : "Re-ranks as you calibrate"}
                </p>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                </span>
                <span className="font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  Live
                </span>
              </div>
            </header>

            {/* Re-ranking career list */}
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {matches.map(({ career, match }, i) => {
                  const rank = i + 1;
                  const prevRank = previousRanks[career.id];
                  const rankChanged = prevRank !== undefined && prevRank !== rank;
                  return (
                    <MatchCard
                      key={career.id}
                      career={career}
                      match={match}
                      rank={rank}
                      delta={match - career.base}
                      rankChanged={rankChanged}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* AI Insight — generative-prompt style callout */}
            <motion.aside
              animate={
                reduce
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 0px rgba(243,146,0,0)",
                        "0 0 22px rgba(243,146,0,0.20)",
                        "0 0 0px rgba(243,146,0,0)",
                      ],
                    }
              }
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative mt-6 overflow-hidden rounded-2xl border border-brand-orange/30 bg-linear-to-br from-brand-orange/8 via-slate-50/40 to-transparent p-5 backdrop-blur-xl dark:from-brand-orange/12 dark:via-slate-900/40"
            >
              {/* Glowing left accent — user-explicit treatment */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-2 left-2 w-[3px] rounded-full bg-linear-to-b from-[#F39200] via-[#FFB54D] to-[#F39200] shadow-[0_0_14px_rgba(243,146,0,0.7)]"
              />
              <div className="relative flex gap-3 pl-3">
                <motion.span
                  aria-hidden
                  animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange ring-1 ring-brand-orange/30"
                >
                  <Sparkles className="size-4" strokeWidth={2.25} />
                </motion.span>
                <div className="min-w-0">
                  <p className="mb-1.5 font-syne text-[10px] font-bold uppercase tracking-[0.22em] text-brand-orange">
                    AI Insight
                  </p>
                  <p
                    className={`text-[13px] font-medium text-slate-700 dark:text-slate-200 ${thai ? "font-thai leading-loose" : "leading-relaxed"}`}
                  >
                    {thai ? (
                      <>
                        การเพิ่มทักษะ{" "}
                        <span className="font-bold text-slate-900 dark:text-white">Machine Learning</span>{" "}
                        อีก{" "}
                        <span className="font-bold text-brand-orange tabular-nums">20 คะแนน</span>{" "}
                        จะช่วยปลดล็อกโอกาสสัมภาษณ์กับ Tech Company ชั้นนำได้ทันที
                      </>
                    ) : (
                      <>
                        Adding{" "}
                        <span className="font-bold text-brand-orange tabular-nums">20 points</span>{" "}
                        to your{" "}
                        <span className="font-bold text-slate-900 dark:text-white">Machine Learning</span>{" "}
                        score unlocks interview opportunities at leading tech employers right now.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.aside>

            {/* Premium CTA */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className={`group relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-[#F39200] to-[#D97706] px-6 py-4 text-base font-bold text-white shadow-[0_0_20px_rgba(243,146,0,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(243,146,0,0.5)] ${thai ? "font-thai leading-relaxed" : "font-syne"}`}
            >
              <Rocket className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
              <span>
                {thai ? "สร้างแผนการเรียนรู้ของคุณ" : "Generate my learning roadmap"}
              </span>
              <ChevronRight
                className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.5}
                aria-hidden
              />
              {/* Sheen */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 blur-md transition-transform duration-700 group-hover:translate-x-[420%]"
              />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
