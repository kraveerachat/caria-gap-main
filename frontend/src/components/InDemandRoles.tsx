/**
 * InDemandRoles — the "in-demand digital roles" overview carousel.
 *
 * Lives on /company-directory as the roles lens (the company zig-zag below is the
 * employer lens). Pick a track (DT / DC) and scroll the highest-demand roles with
 * real 2026 pay bands; tap a card to reveal the CARIA competencies it needs.
 *
 * Extracted from the old landing IndustryDemand section so the landing keeps only
 * the logo wall + CTA, and the detail moves to its own route.
 */
"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Database,
  Code2,
  Cloud,
  PenTool,
  Megaphone,
  Gamepad2,
  Clapperboard,
  Film,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Layers,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { competencyLabel } from "@/lib/competencies";

/* ------------------------------------------------------------------ */
/*  Career catalog — realistic 2026 Thai market benchmarks             */
/*  Codes map directly to the 66 CARIA competencies (lib/competencies). */
/* ------------------------------------------------------------------ */
type Track = "DT" | "DC";

interface CareerRole {
  track: Track;
  Icon: LucideIcon;
  nameTh: string;
  nameEn: string;
  /** จบใหม่ — entry-level starting band. */
  entry: string;
  /** เงินเดือนเฉลี่ยรวม — overall market band. */
  market: string;
  /** Year-on-year demand growth (2026). */
  demand: number;
  /** Real CARIA competency ids. */
  codes: string[];
}

const CAREERS: CareerRole[] = [
  // ---- DT · Digital Technology ----
  {
    track: "DT", Icon: Database, nameTh: "นักวิทยาศาสตร์ข้อมูล", nameEn: "Data Scientist",
    entry: "฿35,000 - ฿55,000", market: "฿55,000 - ฿150,000", demand: 28,
    codes: ["S14_Mathematics", "S03_Complex_Problem_Solving", "S20_Programming", "K17_Mathematics"],
  },
  {
    track: "DT", Icon: Code2, nameTh: "นักพัฒนาซอฟต์แวร์", nameEn: "Software Developer",
    entry: "฿28,000 - ฿45,000", market: "฿45,000 - ฿120,000", demand: 24,
    codes: ["S20_Programming", "S26_Systems_Design", "K05_Computers_and_Electronics"],
  },
  {
    track: "DT", Icon: Cloud, nameTh: "สถาปนิกระบบคลาวด์", nameEn: "Cloud Architect",
    entry: "฿45,000 - ฿70,000", market: "฿70,000 - ฿180,000", demand: 31,
    codes: ["S25_Systems_Analysis", "K05_Computers_and_Electronics", "S28_Troubleshooting", "K28_Telecommunications"],
  },
  {
    track: "DT", Icon: PenTool, nameTh: "นักออกแบบ UI/UX", nameEn: "UI/UX Designer",
    entry: "฿25,000 - ฿40,000", market: "฿40,000 - ฿95,000", demand: 19,
    codes: ["K07_Design", "S18_Operations_Analysis", "S05_Critical_Thinking", "A01_Artistic"],
  },
  // ---- DC · Digital Communication & Media ----
  {
    track: "DC", Icon: Megaphone, nameTh: "นักวางกลยุทธ์โซเชียลมีเดีย", nameEn: "Social Media Strategist",
    entry: "฿22,000 - ฿35,000", market: "฿35,000 - ฿80,000", demand: 22,
    codes: ["K26_Sales_and_Marketing", "K04_Communications_and_Media", "S24_Speaking", "A03_Enterprising"],
  },
  {
    track: "DC", Icon: Gamepad2, nameTh: "นักปั้นโมเดลเกม", nameEn: "Game Modeler",
    entry: "฿25,000 - ฿42,000", market: "฿42,000 - ฿100,000", demand: 18,
    codes: ["K07_Design", "K12_Fine_Arts", "A01_Artistic", "S27_Technology_Design"],
  },
  {
    track: "DC", Icon: Clapperboard, nameTh: "ครีเอเตอร์คอนเทนต์", nameEn: "Content Creator",
    entry: "฿20,000 - ฿35,000", market: "฿35,000 - ฿120,000", demand: 26,
    codes: ["K04_Communications_and_Media", "S29_Writing", "A01_Artistic", "A03_Enterprising"],
  },
  {
    track: "DC", Icon: Film, nameTh: "นักตัดต่อวิดีโอ", nameEn: "Video Editor",
    entry: "฿22,000 - ฿38,000", market: "฿38,000 - ฿90,000", demand: 17,
    codes: ["K12_Fine_Arts", "K04_Communications_and_Media", "S31_Quality_Control_Analysis", "A01_Artistic"],
  },
];

const TRACK_ACCENT: Record<Track, string> = { DT: "#1E90FF", DC: "#F39200" };

/* ---- Career card: salary split + reveal-on-hover/tap CARIA competencies ---- */
function CareerCard({ role, thai }: { role: CareerRole; thai: boolean }) {
  const [open, setOpen] = useState(false);
  const accent = TRACK_ACCENT[role.track];

  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${thai ? role.nameTh : role.nameEn} — ${thai ? "ดูสมรรถนะ CARIA" : "view CARIA competencies"}`}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }}
      className="group relative h-[330px] w-[280px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-brand-orange/40 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:focus-visible:ring-offset-[#070d1a] sm:w-[300px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="flex size-11 items-center justify-center rounded-2xl"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <role.Icon className="size-5" strokeWidth={2.25} aria-hidden />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 font-syne text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-3.5" strokeWidth={2.75} aria-hidden />
          +{role.demand}% · 2026
        </span>
      </div>

      <div className="mt-4">
        <span
          className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: `${accent}1a`, color: accent }}
        >
          {role.track === "DT" ? "Digital Technology" : "Digital Communication"}
        </span>
        <h3 className={`mt-2 text-lg font-bold text-slate-900 dark:text-white ${thai ? "font-thai leading-snug" : "font-syne"}`}>
          {thai ? role.nameTh : role.nameEn}
        </h3>
      </div>

      {/* Salary split — entry vs market */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className={`text-[11px] font-semibold text-slate-500 dark:text-slate-400 ${thai ? "font-thai" : ""}`}>
            {thai ? "จบใหม่" : "Entry-level"}
          </span>
          <span className="font-mono text-[13px] font-bold tabular-nums text-slate-800 dark:text-slate-100">
            {role.entry}
          </span>
        </div>
        <div className="h-px bg-slate-200/70 dark:bg-white/10" />
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className={`text-[11px] font-semibold text-slate-500 dark:text-slate-400 ${thai ? "font-thai" : ""}`}>
            {thai ? "เฉลี่ยรวม" : "Market avg"}
          </span>
          <span className="font-mono text-[13px] font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
            {role.market}
          </span>
        </div>
      </div>

      {/* Hint (fades out as the overlay comes in) */}
      <div className="pointer-events-none absolute inset-x-5 bottom-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 transition-opacity duration-200 group-hover:opacity-0 dark:text-slate-400">
        <Layers className="size-3.5" strokeWidth={2.25} aria-hidden />
        <span className={thai ? "font-thai" : ""}>{thai ? "ชี้/แตะ เพื่อดูสมรรถนะ CARIA" : "Hover / tap for CARIA skills"}</span>
      </div>

      {/* Competency overlay — within the card so the carousel never clips it */}
      <div
        className={`absolute inset-0 flex flex-col gap-3 rounded-3xl border border-brand-orange/25 bg-white/90 p-5 backdrop-blur-xl transition-all duration-300 motion-reduce:transition-none dark:bg-[#0a1322]/92 ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="size-4 text-brand-orange" strokeWidth={2.25} aria-hidden />
          <p className={`text-sm font-bold text-slate-900 dark:text-white ${thai ? "font-thai" : "font-syne"}`}>
            {thai ? "สมรรถนะหลัก (CARIA)" : "Core CARIA competencies"}
          </p>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto pr-0.5 scrollbar-hide">
          {role.codes.map((code) => (
            <div
              key={code}
              className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5"
            >
              <span className="shrink-0 font-mono text-[11px] font-bold text-brand-orange">{code.split("_")[0]}</span>
              <span className="truncate text-[12px] font-medium text-slate-700 dark:text-slate-200">
                {competencyLabel(code, thai)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function InDemandRoles() {
  const { lang } = useLanguage();
  const thai = lang === "th";
  const reduce = useReducedMotion();
  const [track, setTrack] = useState<Track>("DT");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = CAREERS.filter((c) => c.track === track);

  const switchTrack = (next: Track) => {
    setTrack(next);
    scrollRef.current?.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const nudge = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 324, behavior: reduce ? "auto" : "smooth" });
  };

  const TABS: { id: Track; th: string; en: string }[] = [
    { id: "DT", th: "สาย Tech (Digital Technology)", en: "Tech (Digital Technology)" },
    { id: "DC", th: "สาย Media (Digital Communication)", en: "Media (Digital Communication)" },
  ];

  return (
    <section id="in-demand-roles" className="relative overflow-hidden bg-slate-50 py-16 dark:bg-[#070d1a] sm:py-20">
      {/* Ambient SUT navy + orange */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 size-96 rounded-full bg-brand-blue/10 blur-[130px] dark:bg-brand-blue/30" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 size-96 rounded-full bg-brand-orange/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={`text-3xl font-extrabold tracking-tight text-balance text-slate-900 dark:text-white sm:text-4xl ${thai ? "font-thai leading-snug" : "font-syne leading-tight"}`}>
            {thai ? "สายงานดิจิทัลมาแรง พร้อมค่าตอบแทนจริงปี 2026" : "In-demand digital roles & real 2026 pay"}
          </h2>
          <p className={`mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg ${thai ? "font-thai leading-relaxed" : "leading-relaxed"}`}>
            {thai
              ? "เลือกสาย Tech หรือ Media แล้วเลื่อนดูสายงานมาแรงพร้อมช่วงเงินเดือนและสมรรถนะ CARIA ที่ต้องมี"
              : "Pick Tech or Media, then scroll the in-demand roles with pay bands and the CARIA competencies they need."}
          </p>
        </div>

        {/* DT / DC toggle */}
        <div className="mt-8 flex justify-center">
          <div
            role="tablist"
            aria-label={thai ? "เลือกสายงาน" : "Select track"}
            className="inline-flex rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
          >
            {TABS.map((tabItem) => {
              const active = track === tabItem.id;
              const accent = TRACK_ACCENT[tabItem.id];
              return (
                <button
                  key={tabItem.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchTrack(tabItem.id)}
                  className={`relative z-10 rounded-full px-4 py-2 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5 sm:text-sm ${
                    active ? "text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  } ${thai ? "font-thai" : "font-syne"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="roles-track-pill"
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{ background: accent }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {thai ? tabItem.th : tabItem.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Horizontal carousel */}
        <div className="relative mt-8">
          {/* Desktop scroll controls */}
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label={thai ? "เลื่อนซ้าย" : "Scroll left"}
            className="absolute -left-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-md backdrop-blur transition-colors hover:text-brand-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300"
          >
            <ChevronLeft className="size-5" strokeWidth={2.5} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label={thai ? "เลื่อนขวา" : "Scroll right"}
            className="absolute -right-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-md backdrop-blur transition-colors hover:text-brand-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300"
          >
            <ChevronRight className="size-5" strokeWidth={2.5} aria-hidden />
          </button>

          <div
            ref={scrollRef}
            role="tabpanel"
            className="flex snap-x scroll-smooth gap-6 overflow-x-auto clear-both px-2 pt-4 pb-5 scrollbar-hide"
          >
            {filtered.map((role) => (
              <CareerCard key={role.nameEn} role={role} thai={thai} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
