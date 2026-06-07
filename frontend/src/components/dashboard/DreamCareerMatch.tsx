"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, Rocket, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { CAREER_THAI_NAMES } from "@/lib/career-translations";
import { competencyLabel, DOMAIN_META, type CompetencyDomain } from "@/lib/competencies";
import type { DreamCareerAnalysis } from "@/lib/gap-analysis";

/* Match-fit ring ---------------------------------------------------------- */
function MatchRing({ pct, reduce }: { pct: number; reduce: boolean | null }) {
  const size = 132;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#10B981" : pct >= 65 ? "#F39200" : "#FFB54D";
  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: reduce ? "none" : "stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="font-mono text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {pct.toFixed(0)}
          <span className="text-lg font-bold">%</span>
        </span>
      </div>
    </div>
  );
}

/* Single gap row ---------------------------------------------------------- */
function GapRow({ gap, thai }: { gap: DreamCareerAnalysis["gaps"][number]; thai: boolean }) {
  const color = DOMAIN_META[gap.domain as CompetencyDomain]?.color ?? "#F39200";
  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <span className="size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
          {competencyLabel(gap.competency_id, thai)}
        </span>
        <span className="shrink-0 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
          {gap.student_score} <span className="text-slate-400 dark:text-slate-600">/</span> {gap.career_required}
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
        {/* required extent (faint) */}
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${gap.career_required}%`, background: `${color}33` }} />
        {/* current student fill (solid) */}
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${gap.student_score}%`, background: color }} />
      </div>
    </li>
  );
}

/* Section 1: Dream Career Match ------------------------------------------ */
export function DreamCareerMatch({
  analysis,
  userId,
  onRoadmap,
}: {
  analysis: DreamCareerAnalysis;
  userId: string;
  onRoadmap: () => void;
}) {
  const { lang } = useLanguage();
  const thai = lang === "th";
  const reduce = useReducedMotion();

  const id = analysis.career.career_id;
  const name = CAREER_THAI_NAMES[id] || analysis.career.career_name;
  const shortName = name.split(" (")[0];
  const pct = analysis.match_percentage;
  const topGaps = analysis.gaps.slice(0, 5);

  const verdict =
    pct >= 80
      ? thai
        ? "ทักษะของคุณใกล้เคียงกับอาชีพนี้มาก ปิดช่องว่างอีกเล็กน้อยก็พร้อมสมัครได้เลย"
        : "Your skills are very close to this role. Close a few gaps and you are ready to apply."
      : pct >= 65
        ? thai
          ? "คุณมีพื้นฐานที่ดี เน้นพัฒนาทักษะด้านล่างเพื่อเพิ่มความเหมาะสมให้สูงขึ้น"
          : "You have a solid base. Focus on the skills below to raise your fit."
        : thai
          ? "ยังมีระยะห่างอยู่บ้าง โฟกัสที่ช่องว่างสำคัญด้านล่างเพื่อไล่ตามให้ทัน"
          : "There is still a distance to cover. Focus on the key gaps below to catch up.";

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-12 overflow-hidden rounded-3xl border border-brand-orange/25 bg-white/85 p-6 shadow-xl shadow-brand-orange/5 backdrop-blur-xl dark:bg-slate-900/60 md:p-8"
    >
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-orange/10 blur-3xl" />

      <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:gap-9">
        {/* Identity + verdict */}
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-orange">
            <Heart className="size-3" strokeWidth={2.5} aria-hidden />
            {thai ? "อาชีพในฝันของคุณ" : "Your Dream Career"}
          </span>
          <h2 className="mt-3 text-balance font-syne text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {name}
          </h2>
          <p className="mt-2 max-w-xl font-thai text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            {verdict}
          </p>
          <button
            onClick={onRoadmap}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-bold text-brand-orange-foreground shadow-md shadow-brand-orange/20 transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          >
            <Rocket className="size-4" strokeWidth={2.5} aria-hidden />
            <span className="font-thai">{thai ? `แผนการเรียนสู่ ${shortName}` : `Roadmap to ${shortName}`}</span>
            <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        {/* Match ring */}
        <div className="flex shrink-0 flex-col items-center gap-2 border-slate-200/60 dark:border-white/10 md:border-l md:pl-9">
          <MatchRing pct={pct} reduce={reduce} />
          <p className="font-thai text-xs font-bold text-slate-500 dark:text-slate-400">
            {thai ? "ความเหมาะสมกับอาชีพในฝัน" : "Dream career match"}
          </p>
        </div>
      </div>

      {/* Skill gaps */}
      <div className="relative mt-7 border-t border-slate-200/70 pt-6 dark:border-white/10">
        {topGaps.length > 0 ? (
          <>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <TrendingUp className="size-4 text-brand-orange" strokeWidth={2.5} aria-hidden />
              {thai ? "ทักษะที่ต้องพัฒนาเพื่อไปถึงอาชีพในฝัน" : "Skills to close for this role"}
            </h3>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {topGaps.map((gap) => (
                <GapRow key={gap.competency_id} gap={gap} thai={thai} />
              ))}
            </ul>
            <p className="mt-4 font-thai text-xs text-slate-400 dark:text-slate-500">
              {thai
                ? "แถบทึบคือระดับปัจจุบันของคุณ ส่วนแถบจางคือระดับที่อาชีพนี้ต้องการ"
                : "The solid bar is your current level; the faint bar is what this role requires."}
            </p>
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-hidden />
            <p className="font-thai text-sm font-medium text-slate-700 dark:text-slate-200">
              {thai
                ? "คุณมีทักษะครบทุกด้านตามที่อาชีพนี้ต้องการแล้ว พร้อมก้าวสู่เส้นทางอาชีพในฝันได้เลย"
                : "You already meet every competency this role requires. You are ready for this career path."}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
