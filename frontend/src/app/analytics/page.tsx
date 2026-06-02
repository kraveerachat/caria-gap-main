/**
 * CARIA-GAP Analytics & Insights — B2B Data Monetization surface
 *
 * Two registers, one page:
 *  - Public Insights (free):  aggregate market signal in a 2x2 glassmorphism grid.
 *  - Enterprise Analytics:    locked deep-dive (radar + table) behind a premium paywall.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Lock,
  TrendingUp,
  Users,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Globe2,
  Building2,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Mock data — Public Insights                                        */
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

/* ------------------------------------------------------------------ */
/*  Mock data — Enterprise Analytics (locked)                          */
/* ------------------------------------------------------------------ */

const COMPETENCY_RADAR = [
  { axis: "Technical Skill", SUT: 84, KMITL: 79, CU: 88, KU: 71 },
  { axis: "Communication", SUT: 73, KMITL: 68, CU: 81, KU: 76 },
  { axis: "Problem Solving", SUT: 81, KMITL: 77, CU: 86, KU: 74 },
  { axis: "Leadership", SUT: 69, KMITL: 64, CU: 78, KU: 72 },
  { axis: "Adaptability", SUT: 78, KMITL: 75, CU: 82, KU: 70 },
  { axis: "Creativity", SUT: 76, KMITL: 81, CU: 79, KU: 73 },
];

const ENTERPRISE_TABLE = [
  { id: "COH-2026", year: "ปี 4 (Senior)", major: "Computer Engineering", gap: "Cloud / DevOps", readiness: 94 },
  { id: "COH-2027", year: "ปี 3 (Junior)", major: "Information Technology", gap: "Data Engineering", readiness: 91 },
  { id: "COH-2028", year: "ปี 2 (Sophomore)", major: "Computer Science", gap: "AI & Machine Learning", readiness: 89 },
  { id: "COH-2026", year: "ปี 4 (Senior)", major: "Digital Media", gap: "Product Thinking", readiness: 87 },
  { id: "COH-2027", year: "ปี 3 (Junior)", major: "Electrical Engineering", gap: "Cybersecurity", readiness: 85 },
];

const TABS = [
  { id: "public", labelTh: "Public Insights", labelEn: "ฟรี", icon: Globe2 },
  { id: "enterprise", labelTh: "University Intelligence", labelEn: "B2B", icon: Building2 },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ------------------------------------------------------------------ */
/*  Shared tooltip styling                                             */
/* ------------------------------------------------------------------ */

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
  const [tab, setTab] = useState<TabId>("public");

  return (
    <div className="font-thai relative flex min-h-screen flex-col overflow-hidden bg-[#f4f7fc] text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <Navbar />

      {/* Ambient glows — SUT Orange + Navy Blue, dual register */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-[#F39200]/12 blur-[140px] dark:bg-[#F39200]/18" />
        <div className="absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full bg-[#1E90FF]/10 blur-[130px] dark:bg-[#1E90FF]/16" />
        <div className="absolute bottom-0 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#A78BFA]/6 blur-[120px] dark:bg-[#A78BFA]/10" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-5 pt-24 pb-20 sm:px-6 md:pt-28">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:mb-10">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-white/50">
            <Sparkles className="size-3.5 text-[#F39200]" strokeWidth={2.25} />
            CARIA · Analytics &amp; Insights
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-syne text-3xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-4xl md:text-[2.75rem]">
                สถิติเชิงลึก
                <span className="ml-2 bg-linear-to-r from-[#F39200] via-[#FFB54D] to-[#1E90FF] bg-clip-text text-transparent">
                  Insights
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/60 sm:text-[15px]">
                สำรวจสัญญาณตลาดแรงงานดิจิทัลแบบเปิด หรือเข้าถึงระบบวิเคราะห์สมรรถนะของนักศึกษารายสาขาวิชาเพื่อยกระดับหลักสูตรของมหาวิทยาลัย
              </p>
            </div>

            {/* Tab switcher — pill segmented control */}
            <div
              role="tablist"
              aria-label="มุมมองข้อมูล"
              className="relative inline-flex w-full rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-[0_8px_30px_-12px_rgba(0,16,40,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] sm:w-auto"
            >
              {TABS.map((t) => {
                const active = tab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300 sm:flex-none sm:px-5 sm:text-sm",
                      active
                        ? "text-[#1a1100] dark:text-[#1a1100]"
                        : "text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-[#F39200] to-[#FFB54D] shadow-[0_8px_26px_-8px_rgba(243,146,0,0.7)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="size-3.5" strokeWidth={2.25} />
                    <span className="whitespace-nowrap">{t.labelTh}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-px font-syne text-[9px] uppercase tracking-[0.14em]",
                        active
                          ? "bg-[#1a1100]/15 text-[#1a1100]"
                          : "bg-slate-200/70 text-slate-500 dark:bg-white/10 dark:text-white/50",
                      )}
                    >
                      {t.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {tab === "public" ? (
            <motion.section
              key="public"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              aria-labelledby="public-heading"
            >
              <h2 id="public-heading" className="sr-only">
                Public Insights
              </h2>
              <PublicInsights />
            </motion.section>
          ) : (
            <motion.section
              key="enterprise"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              aria-labelledby="enterprise-heading"
            >
              <h2 id="enterprise-heading" className="sr-only">
                Enterprise Analytics
              </h2>
              <EnterpriseAnalytics />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

/* ================================================================== */
/*  Public Insights — 2x2 glassmorphism grid                           */
/* ================================================================== */

function PublicInsights() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
      {/* (1) Bar — Top 5 Digital Skills Lacking */}
      <GlassCard
        title="ทักษะดิจิทัลที่ขาดแคลนสูงสุด 5 อันดับ"
        subtitle="Top 5 Digital Skills Lacking in Graduates · n = 8,450 ผู้ประเมิน"
        accent="#F39200"
        icon={<TrendingUp className="size-4" strokeWidth={2.25} />}
      >
        <div className="h-[260px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={TOP_SKILLS_LACKING}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 0, left: 0 }}
            >
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
              <Tooltip
                cursor={{ fill: "rgba(243,146,0,0.06)" }}
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}% gap`, "Skill gap"]}
              />
              <Bar dataKey="gap" radius={[0, 6, 6, 0]} barSize={18}>
                {TOP_SKILLS_LACKING.map((d) => (
                  <Cell key={d.skill} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* (2) Pie — Trending Career Paths */}
      <GlassCard
        title="เส้นทางอาชีพที่มาแรง"
        subtitle="Trending Career Paths · สัดส่วนความสนใจของผู้สำเร็จการศึกษา"
        accent="#1E90FF"
        icon={<Sparkles className="size-4" strokeWidth={2.25} />}
      >
        <div className="h-[260px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={TRENDING_CAREERS}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
                stroke="none"
              >
                {TRENDING_CAREERS.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number, name: string) => [`${v}%`, name]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* (3) Line — Demand vs Supply */}
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
              <XAxis
                dataKey="month"
                stroke="currentColor"
                tick={{ fontSize: 10, fill: "currentColor" }}
                className="text-slate-500 dark:text-white/50"
              />
              <YAxis
                stroke="currentColor"
                tick={{ fontSize: 10, fill: "currentColor" }}
                className="text-slate-500 dark:text-white/50"
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconType="plainline"
                iconSize={18}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="demand"
                name="ความต้องการตลาด (Demand)"
                stroke="url(#demandGrad)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: "#F39200" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="supply"
                name="บัณฑิตที่ผลิต (Supply)"
                stroke="url(#supplyGrad)"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{ r: 3, strokeWidth: 0, fill: "#1E90FF" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* (4) Summary tile — keeps the 2x2 rhythm without a 4th chart */}
      <GlassCard
        title="ภาพรวมตลาดแรงงานดิจิทัล"
        subtitle="Macro snapshot · อัปเดตล่าสุด มิ.ย. 2026"
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
            <strong className="text-slate-800 dark:text-white/85">ข้อมูลสาธารณะ:</strong> รวมจากการประเมินใน CARIA-GAP แบบ aggregate ไม่ระบุตัวตน เพื่อการศึกษาและวางแผนหลักสูตร
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ================================================================== */
/*  Enterprise Analytics — locked / paywalled                          */
/* ================================================================== */

function EnterpriseAnalytics() {
  return (
    <div className="relative">
      {/* === Underlying "real" content — visible but blurred behind the lock === */}
      <div
        aria-hidden
        className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6"
        // The content stays in the DOM (real layout, real depth) but is non-interactive.
        // The blur overlay above does the rest of the work.
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {/* Radar deep-dive — competency by university */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-syne text-base font-bold">Competency Radar</h3>
              <p className="text-[11px] text-slate-500 dark:text-white/50">
                Deep-dive · จำแนกตามมหาวิทยาลัย / คณะ
              </p>
            </div>
            <span className="rounded-full bg-[#F39200]/10 px-2 py-0.5 font-syne text-[9px] uppercase tracking-[0.18em] text-[#F39200]">
              Pro
            </span>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={COMPETENCY_RADAR} outerRadius="78%">
                <PolarGrid stroke="rgba(148,163,184,0.25)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 10, fill: "currentColor" }}
                  className="text-slate-700 dark:text-white/75"
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "currentColor" }}
                  className="text-slate-400 dark:text-white/40"
                />
                <Radar name="SUT" dataKey="SUT" stroke="#F39200" fill="#F39200" fillOpacity={0.35} />
                <Radar name="KMITL" dataKey="KMITL" stroke="#1E90FF" fill="#1E90FF" fillOpacity={0.2} />
                <Radar name="CU" dataKey="CU" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.18} />
                <Radar name="KU" dataKey="KU" stroke="#34D399" fill="#34D399" fillOpacity={0.16} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enterprise cohort table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-white/10">
            <div>
              <h3 className="font-syne text-base font-bold">Curriculum Performance Analytics</h3>
              <p className="text-[11px] text-slate-500 dark:text-white/50">
                วิเคราะห์สมรรถนะของกลุ่มนักศึกษา (Cohorts) รายปีการศึกษาและสาขาวิชา
              </p>
            </div>
            <span className="hidden rounded-full bg-[#1E90FF]/10 px-2 py-0.5 font-syne text-[9px] uppercase tracking-[0.18em] text-[#1E90FF] sm:inline">
              Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/70 text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:bg-white/4 dark:text-white/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">ชั้นปี (Year)</th>
                  <th className="px-4 py-3 font-semibold">สาขาวิชา (Major)</th>
                  <th className="px-4 py-3 font-semibold">ทักษะที่ขาด (Top Gap)</th>
                  <th className="px-4 py-3 text-right font-semibold">ความพร้อมสู่ตลาดงาน (Readiness %)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/6">
                {ENTERPRISE_TABLE.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-white/2">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-white/50">
                      {row.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white/85">
                      {row.year}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-white/65">{row.major}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/75">{row.gap}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F39200]/10 px-2 py-0.5 font-syne text-[11px] font-bold text-[#F39200]">
                        {row.readiness}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Filter bar mock — visual depth only */}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 bg-slate-50/60 px-6 py-3 dark:border-white/10 dark:bg-white/2">
            {["Cloud", "AI/ML", "Data", "Cybersec", "Product"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 dark:border-white/10 dark:bg-white/4 dark:text-white/65"
              >
                {t}
              </span>
            ))}
            <span className="ml-auto text-[10px] text-slate-500 dark:text-white/45">
              showing 5 cohorts of 12 majors
            </span>
          </div>
        </div>
      </div>

      {/* === The paywall overlay === */}
      <PremiumLockOverlay />
    </div>
  );
}

/* ================================================================== */
/*  Glassmorphism Card                                                 */
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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_40px_-20px_rgba(0,16,40,0.18)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_18px_60px_-22px_rgba(0,16,40,0.28)] dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_10px_40px_-20px_rgba(0,0,0,0.7)] sm:p-6"
    >
      {/* Accent corner glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }}
      />
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-syne text-[15px] font-bold leading-tight text-slate-900 dark:text-white sm:text-base">
            {title}
          </h3>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-white/55">{subtitle}</p>
        </div>
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: accent, boxShadow: `0 6px 18px -8px ${accent}` }}
        >
          {icon}
        </div>
      </header>
      <div className="relative">{children}</div>
    </motion.article>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "orange" | "blue" | "green" | "purple";
}) {
  const tones = {
    orange: "text-[#F39200]",
    blue: "text-[#1E90FF]",
    green: "text-[#34D399]",
    purple: "text-[#A78BFA]",
  } as const;
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/60 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/3">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-white/45">
        {label}
      </dt>
      <dd className={cn("mt-1 font-syne text-xl font-extrabold tracking-tight sm:text-2xl", tones[tone])}>
        {value}
      </dd>
    </div>
  );
}

/* ================================================================== */
/*  Premium Lock Overlay                                               */
/* ================================================================== */

function PremiumLockOverlay() {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-title"
      aria-describedby="lock-subtitle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/40 px-4 backdrop-blur-xl dark:bg-[#030712]/55"
    >
      {/* Soft glow ring behind the modal */}
      <div
        aria-hidden
        className="absolute h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(243,146,0,0.35),rgba(243,146,0,0)_65%)] blur-2xl sm:h-[560px] sm:w-[560px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/80 p-6 text-center shadow-[0_30px_80px_-30px_rgba(243,146,0,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_30px_80px_-30px_rgba(243,146,0,0.55)] sm:p-8"
      >
        {/* Top eyebrow */}
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[#F39200]/40 bg-[#F39200]/10 px-3 py-1 font-syne text-[10px] font-bold uppercase tracking-[0.22em] text-[#F39200]">
          <Sparkles className="size-3" strokeWidth={2.5} />
          Premium · Higher Ed
        </div>

        {/* Glowing lock */}
        <div className="relative mx-auto mb-6 flex size-20 items-center justify-center sm:size-24">
          {/* Halo */}
          <span
            aria-hidden
            className="absolute inset-0 animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(243,146,0,0.55),rgba(243,146,0,0)_70%)] blur-xl"
          />
          {/* Disc */}
          <span
            aria-hidden
            className="absolute inset-2 rounded-full bg-linear-to-br from-[#FFB54D] via-[#F39200] to-[#B86E00] shadow-[inset_0_-8px_22px_rgba(0,0,0,0.35),0_18px_44px_-10px_rgba(243,146,0,0.7)]"
          />
          <Lock className="relative size-10 text-[#1a1100] sm:size-12" strokeWidth={2.25} />
        </div>

        <h3
          id="lock-title"
          className="font-syne text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-[28px]"
        >
          CARIA for Higher Education
        </h3>
        <p
          id="lock-subtitle"
          className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600 text-balance dark:text-white/65 sm:text-[15px]"
        >
          ระบบแดชบอร์ดอัจฉริยะสำหรับผู้บริหารและคณาจารย์ วิเคราะห์ช่องว่างทักษะ (Competency Gap) ของนักศึกษาแบบเรียลไทม์ เพื่อยกระดับหลักสูตรให้ตอบโจทย์ตลาดแรงงาน (Data-Driven Curriculum)
        </p>

        {/* Feature row */}
        <ul className="mx-auto mt-5 grid max-w-sm grid-cols-3 gap-2 text-[10px] font-medium text-slate-500 dark:text-white/55">
          {[
            "Curriculum Gap Analysis",
            "Student Employability Tracker",
            "Export Data for TQF",
          ].map((f) => (
            <li
              key={f}
              className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 backdrop-blur-md dark:border-white/10 dark:bg-white/4"
            >
              {f}
            </li>
          ))}
        </ul>

        {/* CTA — premium glowing button */}
        <Link
          href="/b2b-portal"
          className="group/cta relative mt-7 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-[#F39200] via-[#FFB54D] to-[#F39200] bg-size-[200%_100%] px-6 py-3.5 font-syne text-sm font-bold text-[#1a1100] shadow-[0_18px_44px_-12px_rgba(243,146,0,0.75)] transition-[background-position,transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:bg-position-[100%_0] hover:shadow-[0_22px_56px_-12px_rgba(243,146,0,0.9)] active:translate-y-0 sm:w-auto sm:text-[15px]"
        >
          <span>ติดต่อทีมขาย</span>
          <span className="opacity-70">·</span>
          <span>Contact Sales to Upgrade</span>
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" strokeWidth={2.5} />
          {/* Sheen */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 blur-md transition-transform duration-700 group-hover/cta:translate-x-[420%]"
          />
        </Link>

        <p className="mt-4 text-[10px] text-slate-500 dark:text-white/45">
          เริ่มต้นการสาธิตฟรี - ใช้งานโดยคณบดีและฝ่ายวิชาการชั้นนำ
        </p>
      </motion.div>
    </motion.div>
  );
}
