/**
 * CARIA-GAP Insights — student-facing, 100% free.
 *
 * One scrollable dashboard that merges the student's Personal insights (their own
 * matched careers, competency radar, and top skill gaps) with Public market
 * signals (skills in demand, trending careers, demand vs supply). No paywall:
 * the faculty curriculum & skill-gap analytics are inlined at the foot of the page.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp,
  Users,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Building2,
  GraduationCap,
  Target,
  FileSearch,
  ChevronDown,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DrilldownRadar from "@/components/dashboard/DrilldownRadar";
import { cn } from "@/lib/utils";
import { useGapAnalysis } from "@/hooks/use-api";
import { useLanguage } from "@/components/language-provider";
import { competencyLabel } from "@/lib/competencies";
import { getTrackForCareer, getMes, getTrackReadiness } from "@/lib/sut-tracks";
import { CAREER_THAI_NAMES } from "@/lib/career-translations";
import type { CareerResult, Top10Response } from "@/types";

/* ------------------------------------------------------------------ */
/*  Public market mock data — logical for a tech student               */
/* ------------------------------------------------------------------ */

const TOP_SKILLS_LACKING = [
  { skill: "Cloud / DevOps", gap: 78, fill: "#F39200" },
  { skill: "Data Engineering", gap: 71, fill: "#1E90FF" },
  { skill: "AI / Prompt Eng.", gap: 66, fill: "#A78BFA" },
  { skill: "Cybersecurity", gap: 61, fill: "#34D399" },
  { skill: "Product Thinking", gap: 54, fill: "#EC4899" },
];

const TRENDING_CAREERS = [
  { name: "Data Scientist", value: 28, color: "#F39200" },
  { name: "Cloud Engineer", value: 22, color: "#1E90FF" },
  { name: "AI / ML Engineer", value: 18, color: "#A78BFA" },
  { name: "UX / Product", value: 17, color: "#34D399" },
  { name: "Cybersecurity", value: 15, color: "#EC4899" },
];

const DEMAND_VS_SUPPLY = [
  { month: "ม.ค.", demand: 1240, supply: 820 },
  { month: "ก.พ.", demand: 1380, supply: 870 },
  { month: "มี.ค.", demand: 1520, supply: 910 },
  { month: "เม.ย.", demand: 1690, supply: 960 },
  { month: "พ.ค.", demand: 1880, supply: 1010 },
  { month: "มิ.ย.", demand: 2110, supply: 1090 },
];

const tooltipStyle = {
  background: "rgba(13, 23, 38, 0.92)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  backdropFilter: "blur(8px)",
  color: "#e9eef7",
  fontSize: "12px",
  padding: "8px 12px",
};

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function AnalyticsPage() {
  const { lang } = useLanguage();
  const thai = lang === "th";

  return (
    <div className="font-thai relative flex min-h-screen flex-col overflow-hidden bg-[#f4f7fc] text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <Navbar />

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-[#F39200]/12 blur-[140px] dark:bg-[#F39200]/18" />
        <div className="absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full bg-[#1E90FF]/10 blur-[130px] dark:bg-[#1E90FF]/16" />
        <div className="absolute bottom-0 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#A78BFA]/6 blur-[120px] dark:bg-[#A78BFA]/10" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-5 pt-24 pb-20 sm:px-6 md:pt-28">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:mb-10">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-white/50">
            <Sparkles className="size-3.5 text-[#F39200]" strokeWidth={2.25} />
            CARIA · Insights
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-syne text-3xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-4xl md:text-[2.75rem]">
                {thai ? "สถิติเชิงลึกของคุณ" : "Your Insights"}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/60 sm:text-[15px]">
                {thai
                  ? "ดูผลวิเคราะห์สมรรถนะของคุณควบคู่กับสัญญาณตลาดแรงงานดิจิทัล ใช้งานได้ฟรีทั้งหมดสำหรับนักศึกษา"
                  : "Your competency results alongside live digital job-market signals. Free for students, all of it."}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3.5" strokeWidth={2.5} />
              {thai ? "ฟรี 100% สำหรับนักศึกษา" : "100% free for students"}
            </span>
          </div>
        </header>

        {/* Personal insights */}
        <PersonalInsights thai={thai} />

        {/* Public market insights */}
        <section aria-labelledby="market-heading" className="mt-12">
          <div className="mb-5 flex items-center gap-2.5">
            <Target className="size-5 text-[#1E90FF]" strokeWidth={2.25} aria-hidden />
            <h2 id="market-heading" className="font-syne text-xl font-bold tracking-tight">
              {thai ? "ภาพรวมตลาดแรงงานดิจิทัล" : "Digital Job Market"}
            </h2>
          </div>
          <PublicInsights />
        </section>

        {/* Faculty & curriculum analytics — university module, inline (no handoff) */}
        <FacultyCurriculumAnalytics thai={thai} />
      </main>

      <Footer />
    </div>
  );
}

/* ================================================================== */
/*  Personal Insights — the student's own data                         */
/* ================================================================== */

function PersonalInsights({ thai }: { thai: boolean }) {
  // Result comes from the localStorage handoff (read post-mount to avoid a
  // hydration mismatch); the gap analysis for the top career goes through React
  // Query (Roadmap Phase 3). Same data shapes as before.
  const [result, setResult] = useState<Top10Response | null>(null);
  const [resultLoaded, setResultLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("caria_last_result");
      setResult(raw ? (JSON.parse(raw) as Top10Response) : null);
    } catch {
      setResult(null);
    }
    setResultLoaded(true);
  }, []);

  const careers = result?.top10_careers ?? [];
  const top = careers[0];

  const { data: gap, isLoading: gapLoading } = useGapAnalysis(result?.user_id, top?.career_id);
  const radar = gap?.radar_data ?? null;
  const gaps = useMemo(
    () => (gap ? [...gap.gaps].sort((a, b) => b.gap_score - a.gap_score).slice(0, 5) : []),
    [gap],
  );
  // "Loaded" once the handoff is read and, if there's a career to analyze, its query settled.
  const loaded = resultLoaded && (!top || !gapLoading);

  // Empty state: not a paywall, just an invitation to take the assessment.
  if (loaded && (!result || careers.length === 0)) {
    return (
      <section className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300/70 bg-white/50 px-6 py-14 text-center backdrop-blur-md dark:border-white/10 dark:bg-white/3">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-slate-400 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-500">
          <FileSearch className="size-7" strokeWidth={1.75} aria-hidden />
        </div>
        <h2 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
          {thai ? "ยังไม่มีผลวิเคราะห์ส่วนตัว" : "No personal insights yet"}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {thai
            ? "ทำแบบประเมิน Hybrid 3 นาที เพื่อปลดล็อกเรดาร์สมรรถนะและช่องว่างทักษะของคุณ ด้านล่างยังดูภาพรวมตลาดได้ฟรี"
            : "Take the 3-minute hybrid assessment to unlock your competency radar and skill gaps. Market insights below are free to browse."}
        </p>
        <Link
          href="/assessment"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-brand-orange-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          {thai ? "เริ่มทำแบบประเมิน" : "Start assessment"}
          <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
        </Link>
      </section>
    );
  }

  const track = top ? getTrackForCareer(top) : null;
  const mes = top ? getMes(top) : 0;
  const readiness = getTrackReadiness(mes);

  return (
    <section aria-labelledby="personal-heading">
      <div className="mb-5 flex items-center gap-2.5">
        <GraduationCap className="size-5 text-brand-orange" strokeWidth={2.25} aria-hidden />
        <h2 id="personal-heading" className="font-syne text-xl font-bold tracking-tight">
          {thai ? "ผลวิเคราะห์ของคุณ" : "Your Results"}
        </h2>
        {top && (
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: `${readiness.color}1f`, color: readiness.color }}
          >
            {mes} MES · {thai ? readiness.labelTh : readiness.labelEn}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
        {/* Radar */}
        <div className="lg:col-span-3">
          {radar ? (
            <DrilldownRadar radarData={radar} accent={track?.accent ?? "#F39200"} />
          ) : (
            <div className="flex h-[420px] animate-pulse items-center justify-center rounded-2xl border border-border/60 bg-card/40">
              <span className="text-sm text-muted-foreground">{thai ? "กำลังโหลดเรดาร์..." : "Loading radar..."}</span>
            </div>
          )}
        </div>

        {/* Top skill gaps + matched careers */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Target className="size-4 text-rose-500" strokeWidth={2.25} aria-hidden />
              {thai ? "ช่องว่างทักษะสูงสุด 5 อันดับ" : "Your Top 5 Skill Gaps"}
            </h3>
            {gaps.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {gaps.map((g) => {
                  const pct = Math.max(0, Math.min(100, Math.round(g.gap_score)));
                  return (
                    <li key={g.competency_id}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200">
                          {competencyLabel(g.competency_id, thai)}
                        </span>
                        <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-rose-500">-{pct}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div className="h-full rounded-full bg-rose-500/80" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-2.5" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
              {thai ? "อาชีพที่ตรงกับคุณ" : "Your Matched Careers"}
            </h3>
            <ul className="flex flex-col gap-2">
              {careers.slice(0, 5).map((c, i) => (
                <li key={c.career_id} className="flex items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                    {CAREER_THAI_NAMES[c.career_id] || c.career_name}
                  </span>
                  <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-brand-orange">
                    {Math.round(c.match_percentage)}%
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={`/dashboard?user=${result?.user_id ?? ""}`}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange transition-colors hover:text-brand-orange/80"
            >
              {thai ? "ไปที่แดชบอร์ดและดาวน์โหลด PDF" : "Open dashboard & download PDF"}
              <ArrowRight className="size-3.5" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Public Insights — 2x2 market grid                                  */
/* ================================================================== */

function PublicInsights() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
      <GlassCard
        title="ทักษะดิจิทัลที่ขาดแคลนสูงสุด 5 อันดับ"
        subtitle="Top 5 Digital Skills Lacking · n = 8,450 ผู้ประเมิน"
        accent="#F39200"
        icon={<TrendingUp className="size-4" strokeWidth={2.25} />}
      >
        <div className="h-[260px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TOP_SKILLS_LACKING} layout="vertical" margin={{ top: 8, right: 24, bottom: 0, left: 0 }}>
              <CartesianGrid horizontal={false} stroke="rgba(148,163,184,0.18)" />
              <XAxis
                type="number"
                stroke="currentColor"
                tick={{ fontSize: 10, fill: "currentColor" }}
                className="text-slate-500 dark:text-white/50"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey="skill"
                type="category"
                stroke="currentColor"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-700 dark:text-white/80"
                width={120}
              />
              <Tooltip cursor={{ fill: "rgba(243,146,0,0.06)" }} contentStyle={tooltipStyle} formatter={(v: number) => [`${v}% gap`, "Skill gap"]} />
              <Bar dataKey="gap" radius={[0, 6, 6, 0]} barSize={18}>
                {TOP_SKILLS_LACKING.map((d) => (
                  <Cell key={d.skill} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard
        title="เส้นทางอาชีพที่มาแรง"
        subtitle="Trending Career Paths · สัดส่วนความสนใจ"
        accent="#1E90FF"
        icon={<Sparkles className="size-4" strokeWidth={2.25} />}
      >
        <div className="h-[260px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={TRENDING_CAREERS} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={3} stroke="none">
                {TRENDING_CAREERS.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v}%`, name]} />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard
        title="อุปสงค์ vs อุปทาน บุคลากรสายเทคโนโลยี"
        subtitle="Demand vs Supply of Tech Talent · 6 เดือนล่าสุด"
        accent="#34D399"
        icon={<TrendingUp className="size-4" strokeWidth={2.25} />}
      >
        <div className="h-[260px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DEMAND_VS_SUPPLY} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F39200" />
                  <stop offset="100%" stopColor="#FFB54D" />
                </linearGradient>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1E90FF" />
                  <stop offset="100%" stopColor="#6AA6E8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" stroke="rgba(148,163,184,0.18)" vertical={false} />
              <XAxis dataKey="month" stroke="currentColor" tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500 dark:text-white/50" />
              <YAxis stroke="currentColor" tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500 dark:text-white/50" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="plainline" iconSize={18} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="monotone" dataKey="demand" name="ความต้องการตลาด (Demand)" stroke="url(#demandGrad)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: "#F39200" }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="supply" name="บัณฑิตที่ผลิต (Supply)" stroke="url(#supplyGrad)" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3, strokeWidth: 0, fill: "#1E90FF" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard
        title="ภาพรวมตลาดแรงงานดิจิทัล"
        subtitle="Macro snapshot · อัปเดต มิ.ย. 2026"
        accent="#A78BFA"
        icon={<Users className="size-4" strokeWidth={2.25} />}
      >
        <div className="flex h-full flex-col justify-between gap-5">
          <dl className="grid grid-cols-2 gap-4">
            <Stat label="ผู้เข้าประเมินสะสม" value="8,450+" tone="orange" />
            <Stat label="Skill gap เฉลี่ย" value="46%" tone="blue" />
            <Stat label="สาย DT เติบโต YoY" value="+38%" tone="green" />
            <Stat label="Demand : Supply" value="1.94×" tone="purple" />
          </dl>
          <div className="rounded-xl border border-slate-200/70 bg-white/60 p-4 text-xs leading-relaxed text-slate-600 backdrop-blur-md dark:border-white/10 dark:bg-white/3 dark:text-white/60">
            <ShieldCheck className="mb-1.5 inline size-3.5 text-[#34D399]" strokeWidth={2.25} />{" "}
            <strong className="text-slate-800 dark:text-white/85">ข้อมูลสาธารณะ:</strong> รวมจากการประเมินใน CARIA-GAP แบบ aggregate ไม่ระบุตัวตน
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ================================================================== */
/*  Curriculum coverage & evolution — inline university module          */
/* ================================================================== */

type Faculty = "DT" | "DC";

const FACULTY_META: Record<Faculty, { th: string; en: string; accent: string }> = {
  DT: { th: "เทคโนโลยีดิจิทัล (DT)", en: "Digital Technology (DT)", accent: "#F39200" },
  DC: { th: "นิเทศศาสตร์ดิจิทัล (DC)", en: "Digital Communication (DC)", accent: "#1E90FF" },
};

/* Workforce readiness by academic year — positive progression, Year 1 → Year 4. */
const YEAR_READINESS: Record<Faculty, [number, number, number, number]> = {
  DT: [40, 53, 67, 78],
  DC: [44, 56, 69, 80],
};

/* Radar axes per faculty: 2026 market demand vs the SUT curriculum coverage
   delivered by graduation (Year 4). Short labels keep the polar axis legible on
   mobile; the full name surfaces in the tooltip. */
const RADAR_AXES: Record<
  Faculty,
  { short: string; th: string; en: string; market: number; curriculum: number }[]
> = {
  DT: [
    { short: "Cloud", th: "คลาวด์คอมพิวติ้ง", en: "Cloud Computing", market: 96, curriculum: 70 },
    { short: "Data", th: "วิศวกรรมข้อมูล", en: "Data Engineering", market: 92, curriculum: 80 },
    { short: "AI/ML", th: "AI / ML", en: "AI / ML", market: 98, curriculum: 58 },
    { short: "Cyber", th: "ความมั่นคงไซเบอร์", en: "Cybersecurity", market: 88, curriculum: 66 },
    { short: "Arch", th: "สถาปัตยกรรมซอฟต์แวร์", en: "Software Architecture", market: 90, curriculum: 82 },
  ],
  DC: [
    { short: "Content", th: "กลยุทธ์คอนเทนต์", en: "Content Strategy", market: 90, curriculum: 76 },
    { short: "Motion", th: "โมชัน / วิดีโอ", en: "Motion / Video", market: 86, curriculum: 72 },
    { short: "UX", th: "UX Research", en: "UX Research", market: 93, curriculum: 64 },
    { short: "Brand", th: "แบรนด์ & โซเชียล", en: "Brand & Social", market: 88, curriculum: 78 },
    { short: "Game", th: "เกม / 3D", en: "Game / 3D", market: 84, curriculum: 60 },
  ],
};

/* AI recommendation hook — faculty-aware mock (the B2B teaser). */
const AI_INSIGHT: Record<Faculty, { th: string; en: string }> = {
  DT: {
    th: "พบช่องว่าง 15% ในกลุ่มทักษะ AI/ML ของนักศึกษาชั้นปีที่ 3 ระบบแนะนำให้พิจารณาเพิ่มโมดูล 'Applied Prompt Engineering' ในรายวิชาเทคโนโลยีสมัยใหม่ เพื่อยกระดับอัตราการได้งาน (Employability) เป็น 90%+",
    en: "A 15% gap shows in the AI/ML cluster for Year 3 students. The system suggests adding an 'Applied Prompt Engineering' module to the modern-technology course to lift employability toward 90%+.",
  },
  DC: {
    th: "พบช่องว่าง 18% ในกลุ่มทักษะ UX Research ของนักศึกษาชั้นปีที่ 3 ระบบแนะนำให้เพิ่มเวิร์กช็อป 'Generative UX & User Testing' ในรายวิชาออกแบบสื่อ เพื่อยกระดับอัตราการได้งาน (Employability) เป็น 90%+",
    en: "An 18% gap shows in the UX Research cluster for Year 3 students. The system suggests adding a 'Generative UX & User Testing' workshop to the media-design course to lift employability toward 90%+.",
  },
};

function FacultyCurriculumAnalytics({ thai }: { thai: boolean }) {
  const reduce = useReducedMotion();
  const [faculty, setFaculty] = useState<Faculty>("DT");
  const [year, setYear] = useState(3); // default to juniors

  const readinessByYear = YEAR_READINESS[faculty];
  const selectedReadiness = readinessByYear[year - 1];
  const gradReadiness = readinessByYear[3]; // Year 4 = full curriculum delivery
  const accent = FACULTY_META[faculty].accent;

  // SUT polygon = full curriculum coverage scaled by how far the cohort has
  // progressed; its gap to the (fixed) 2026 market polygon shrinks year on year.
  const radarData = useMemo(
    () =>
      RADAR_AXES[faculty].map((a) => ({
        axis: a.short,
        full: thai ? a.th : a.en,
        market: a.market,
        sut: Math.round((a.curriculum * selectedReadiness) / gradReadiness),
      })),
    [faculty, thai, selectedReadiness, gradReadiness],
  );

  const fullByShort = useMemo(() => {
    const m: Record<string, string> = {};
    RADAR_AXES[faculty].forEach((a) => (m[a.short] = thai ? a.th : a.en));
    return m;
  }, [faculty, thai]);

  return (
    <section aria-labelledby="curriculum-heading" className="mt-12">
      <div className="mb-5">
        <h2
          id="curriculum-heading"
          className="font-syne text-lg font-bold leading-snug tracking-tight text-balance text-slate-800 dark:text-slate-200 sm:text-xl"
        >
          {thai ? (
            <>
              📊 ความครอบคลุมและพัฒนาการของหลักสูตร{" "}
              <span className="font-medium text-slate-500 dark:text-slate-400">(Curriculum Coverage &amp; Evolution)</span>
            </>
          ) : (
            <>
              📊 Curriculum coverage &amp; evolution{" "}
              <span className="font-medium text-slate-500 dark:text-slate-400">(SUT)</span>
            </>
          )}
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_40px_-20px_rgba(0,16,40,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_10px_40px_-20px_rgba(0,0,0,0.7)] sm:p-7"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full opacity-20 blur-3xl transition-colors duration-500"
          style={{ background: accent }}
        />

        <div className="relative grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Controls */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            {/* Faculty selector */}
            <div>
              <label
                htmlFor="faculty-select"
                className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
              >
                <Building2 className="size-3.5 text-[#1E90FF]" strokeWidth={2.5} aria-hidden />
                {thai ? "เลือกคณะ / สาขา" : "Faculty / major"}
              </label>
              <div className="relative">
                <select
                  id="faculty-select"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value as Faculty)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white/70 pl-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-[#1E90FF]/50 focus:ring-2 focus:ring-[#1E90FF]/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                >
                  <option value="DT">{thai ? FACULTY_META.DT.th : FACULTY_META.DT.en}</option>
                  <option value="DC">{thai ? FACULTY_META.DC.th : FACULTY_META.DC.en}</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </div>
            </div>

            {/* Workforce-readiness progression by academic year */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {thai ? "ความพร้อมสู่ตลาดแรงงาน" : "Workforce readiness"}
              </p>
              <p className="mb-2.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {thai ? "พัฒนาการความพร้อมของนักศึกษาตลอดหลักสูตร" : "Student readiness growth across the programme"}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((y) => {
                  const selected = year === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setYear(y)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-2xl border p-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E90FF] motion-reduce:transition-none",
                        selected
                          ? "border-[#1E90FF]/50 bg-[#1E90FF]/10 shadow-sm dark:bg-[#1E90FF]/15"
                          : "border-slate-200 bg-white/60 hover:border-[#1E90FF]/35 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wide",
                          selected ? "text-[#1E90FF] dark:text-[#7FB0FF]" : "text-slate-500 dark:text-slate-400",
                        )}
                      >
                        {thai ? `ปี ${y}` : `Year ${y}`}
                      </span>
                      <span className="font-syne text-2xl font-extrabold tabular-nums text-slate-800 dark:text-slate-100">
                        {readinessByYear[y - 1]}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected-cohort readout */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-4 text-emerald-500" strokeWidth={2.5} aria-hidden />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {thai ? `ความพร้อมของนักศึกษาปี ${year}` : `Year ${year} cohort readiness`}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-syne text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  {selectedReadiness}%
                </span>
                {year > 1 && (
                  <span className="text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    ▲ +{selectedReadiness - readinessByYear[year - 2]} {thai ? "จากปีก่อน" : "vs prev. year"}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {thai
                  ? "คำนวณจากผลรวม CARIA MES แบบ aggregate ไม่ระบุตัวตน เทียบกับความต้องการตลาดเทคปี 2026"
                  : "Aggregated, anonymized CARIA MES output, benchmarked against 2026 tech-market demand."}
              </p>
            </div>
          </div>

          {/* Radar — curriculum coverage vs market demand */}
          <div className="lg:col-span-8">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {thai ? "ความครอบคลุมของหลักสูตร เทียบกับ ตลาดโลก 2026" : "Curriculum coverage vs market demand (2026)"}
                </h3>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {`${thai ? FACULTY_META[faculty].th : FACULTY_META[faculty].en} · ${
                    thai ? `ปี ${year}` : `Year ${year}`
                  } · Curriculum vs Market Demand`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="size-3 rounded-sm border-2 border-dashed border-[#1E90FF]" aria-hidden />
                  {thai ? "ตลาดโลก 2026" : "Market 2026"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="size-3 rounded-sm bg-[#F39200]" aria-hidden />
                  {thai ? "หลักสูตร SUT" : "SUT Curriculum"}
                </span>
              </div>
            </div>

            <div className="h-[300px] w-full sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%" margin={{ top: 10, right: 18, bottom: 6, left: 18 }}>
                  <PolarGrid stroke="rgba(148,163,184,0.22)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-slate-600 dark:text-slate-300"
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={thai ? "ตลาดโลก 2026" : "Market 2026"}
                    dataKey="market"
                    stroke="#1E90FF"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    fill="#1E90FF"
                    fillOpacity={0.06}
                    isAnimationActive={!reduce}
                  />
                  <Radar
                    name={thai ? "หลักสูตร SUT" : "SUT Curriculum"}
                    dataKey="sut"
                    stroke="#F39200"
                    strokeWidth={2.5}
                    fill="#F39200"
                    fillOpacity={0.32}
                    isAnimationActive={!reduce}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={false}
                    labelFormatter={(label) => fullByShort[label as string] ?? String(label)}
                    formatter={(v: number, name: string) => [`${v}%`, name]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* AI recommendation — the B2B hook */}
            <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#A78BFA]/25 bg-linear-to-br from-[#F39200]/[0.07] via-transparent to-[#1E90FF]/[0.07] p-4 backdrop-blur-md sm:p-5">
              <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#A78BFA]/15 blur-3xl" />
              <div className="relative flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#A78BFA]/15 text-[#A78BFA]">
                  <Sparkles className="size-4" strokeWidth={2.25} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">💡 AI Curriculum Recommendation</h4>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {thai ? AI_INSIGHT[faculty].th : AI_INSIGHT[faculty].en}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Shared cards                                                       */
/* ================================================================== */

function GlassCard({
  title,
  subtitle,
  accent,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_40px_-20px_rgba(0,16,40,0.18)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_18px_60px_-22px_rgba(0,16,40,0.28)] dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_10px_40px_-20px_rgba(0,0,0,0.7)] sm:p-6"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }}
      />
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-syne text-[15px] font-bold leading-tight text-slate-900 dark:text-white sm:text-base">{title}</h3>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-white/55">{subtitle}</p>
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: accent, boxShadow: `0 6px 18px -8px ${accent}` }}>
          {icon}
        </div>
      </header>
      <div className="relative">{children}</div>
    </motion.article>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "orange" | "blue" | "green" | "purple" }) {
  const tones = {
    orange: "text-[#F39200]",
    blue: "text-[#1E90FF]",
    green: "text-[#34D399]",
    purple: "text-[#A78BFA]",
  } as const;
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/60 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/3">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-white/45">{label}</dt>
      <dd className={cn("mt-1 font-syne text-xl font-extrabold tracking-tight sm:text-2xl", tones[tone])}>{value}</dd>
    </div>
  );
}
