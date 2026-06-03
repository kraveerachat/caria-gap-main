/**
 * CompanyDirectory — "Industry Demand & Salary Insights" lead magnet.
 *
 * A filterable directory of hiring companies (DT / DC) with a real-2026 salary
 * progression and the CARIA competencies each one screens for. Filter by track
 * (DT/DC) and career group, then read each company in a zig-zag report row:
 * a white logo plate beside a details column with a 4-stage salary timeline.
 *
 * Logos are expected at /public/logos/<name>.png; any missing file falls back
 * to a clean wordmark so the directory never shows a broken image.
 */
"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { competencyLabel } from "@/lib/competencies";

type Category = "DT" | "DC";

interface RawCompany {
  name: string;
  category: Category;
  group: string;
  logo: string;
  salary: { fresh: string; avg: string };
  skills: string[];
}

// Embedded 2026 dataset (kept verbatim from the brief).
const companiesData: RawCompany[] = [
  // --- DT (Tech / Data / Cloud) ---
  { name: "Google", category: "DT", group: "Enterprise Software", logo: "/logos/Google.png", salary: { fresh: "50K-80K", avg: "100K-250K" }, skills: ["S20_Programming", "S03_Complex_Problem_Solving"] },
  { name: "Agoda", category: "DT", group: "Data Science", logo: "/logos/Agoda.png", salary: { fresh: "45K-70K", avg: "90K-200K" }, skills: ["S14_Mathematics", "K05_Computers_and_Electronics"] },
  { name: "Microsoft", category: "DT", group: "Cloud Technology", logo: "/logos/Microsoft.png", salary: { fresh: "45K-75K", avg: "95K-220K" }, skills: ["S25_Systems_Analysis", "S26_Systems_Design"] },
  { name: "KBTG", category: "DT", group: "Enterprise Software", logo: "/logos/KBTG.png", salary: { fresh: "35K-55K", avg: "70K-150K" }, skills: ["S20_Programming", "S11_Learning_Strategies"] },
  { name: "SCB 10X", category: "DT", group: "Data Science", logo: "/logos/SCB 10X.png", salary: { fresh: "40K-60K", avg: "80K-160K" }, skills: ["S18_Operations_Analysis", "A04_Investigative"] },
  { name: "Bluebik", category: "DT", group: "IT Support", logo: "/logos/Bluebik.png", salary: { fresh: "35K-50K", avg: "65K-140K" }, skills: ["S25_Systems_Analysis", "S05_Critical_Thinking"] },
  { name: "Meta", category: "DT", group: "Enterprise Software", logo: "/logos/Meta.png", salary: { fresh: "50K-80K", avg: "100K-250K" }, skills: ["S20_Programming", "A03_Enterprising"] },
  { name: "Amazon", category: "DT", group: "Cloud Technology", logo: "/logos/Amazon.png", salary: { fresh: "45K-75K", avg: "95K-220K" }, skills: ["S26_Systems_Design", "K05_Computers_and_Electronics"] },
  { name: "IBM", category: "DT", group: "Data Science", logo: "/logos/IBM.png", salary: { fresh: "40K-65K", avg: "85K-180K" }, skills: ["S25_Systems_Analysis", "S14_Mathematics"] },
  { name: "Nvidia", category: "DT", group: "Enterprise Software", logo: "/logos/Nvidia.png", salary: { fresh: "50K-85K", avg: "110K-260K" }, skills: ["S20_Programming", "K17_Mathematics"] },
  { name: "Salesforce", category: "DT", group: "Cloud Technology", logo: "/logos/Salesforce.png", salary: { fresh: "45K-70K", avg: "90K-200K" }, skills: ["K06_Customer_and_Personal_Service", "S25_Systems_Analysis"] },
  { name: "SAP", category: "DT", group: "Enterprise Software", logo: "/logos/SAP.png", salary: { fresh: "40K-65K", avg: "85K-180K" }, skills: ["S26_Systems_Design", "K01_Administration_and_Management"] },
  { name: "Snowflake", category: "DT", group: "Data Science", logo: "/logos/Snowflake.png", salary: { fresh: "45K-75K", avg: "95K-210K" }, skills: ["S14_Mathematics", "K05_Computers_and_Electronics"] },
  { name: "True Digital Group", category: "DT", group: "Data Science", logo: "/logos/True Digital Group.png", salary: { fresh: "30K-50K", avg: "60K-130K" }, skills: ["S03_Complex_Problem_Solving", "A04_Investigative"] },
  { name: "MFEC", category: "DT", group: "IT Support", logo: "/logos/MFEC.png", salary: { fresh: "25K-40K", avg: "50K-100K" }, skills: ["S28_Troubleshooting", "K05_Computers_and_Electronics"] },
  { name: "G-Able", category: "DT", group: "Enterprise Software", logo: "/logos/G-Able.png", salary: { fresh: "25K-40K", avg: "50K-100K" }, skills: ["S20_Programming", "S25_Systems_Analysis"] },
  { name: "INET", category: "DT", group: "Cloud Technology", logo: "/logos/INET.png", salary: { fresh: "25K-40K", avg: "50K-100K" }, skills: ["S08_Installation", "K28_Telecommunications"] },
  { name: "Cisco", category: "DT", group: "Cloud Technology", logo: "/logos/Cisco.png", salary: { fresh: "40K-65K", avg: "85K-180K" }, skills: ["K28_Telecommunications", "S28_Troubleshooting"] },
  { name: "Botnoi", category: "DT", group: "Data Science", logo: "/logos/Botnoi.png", salary: { fresh: "30K-50K", avg: "60K-130K" }, skills: ["S20_Programming", "S01_Active_Learning"] },
  { name: "Coral", category: "DT", group: "Web Application", logo: "/logos/Coral.png", salary: { fresh: "35K-55K", avg: "70K-150K" }, skills: ["S20_Programming", "A01_Artistic"] },
  // --- DC (Media / Game / Agency) ---
  { name: "LINE Thailand", category: "DC", group: "Digital Content", logo: "/logos/LINE Thailand.png", salary: { fresh: "35K-50K", avg: "65K-140K" }, skills: ["K04_Communications_and_Media", "A06_Social"] },
  { name: "TikTok", category: "DC", group: "Digital Content", logo: "/logos/TikTok.png", salary: { fresh: "35K-55K", avg: "70K-150K" }, skills: ["K04_Communications_and_Media", "A01_Artistic"] },
  { name: "Netflix", category: "DC", group: "Film", logo: "/logos/Netflix.png", salary: { fresh: "40K-60K", avg: "80K-160K" }, skills: ["K04_Communications_and_Media", "S05_Critical_Thinking"] },
  { name: "Disney", category: "DC", group: "Animation", logo: "/logos/Disney.png", salary: { fresh: "40K-60K", avg: "80K-160K" }, skills: ["A01_Artistic", "K12_Fine_Arts"] },
  { name: "Garena", category: "DC", group: "Game", logo: "/logos/Garena (Sea Group).png", salary: { fresh: "30K-50K", avg: "60K-130K" }, skills: ["K06_Customer_and_Personal_Service", "A03_Enterprising"] },
  { name: "Epic Games", category: "DC", group: "Game", logo: "/logos/Epic Games.png", salary: { fresh: "45K-70K", avg: "90K-180K" }, skills: ["A01_Artistic", "S20_Programming"] },
  { name: "Electronic Arts", category: "DC", group: "Game", logo: "/logos/Electronic Arts.png", salary: { fresh: "40K-65K", avg: "85K-170K" }, skills: ["A01_Artistic", "S26_Systems_Design"] },
  { name: "Sony", category: "DC", group: "Game", logo: "/logos/Sony.png", salary: { fresh: "35K-60K", avg: "75K-150K" }, skills: ["K05_Computers_and_Electronics", "K07_Design"] },
  { name: "Ogilvy", category: "DC", group: "Marketing", logo: "/logos/Ogilvy (Global).png", salary: { fresh: "25K-40K", avg: "50K-120K" }, skills: ["K04_Communications_and_Media", "S19_Persuasion"] },
  { name: "Wunderman Thompson", category: "DC", group: "Marketing", logo: "/logos/Wunderman Thompson.png", salary: { fresh: "25K-40K", avg: "50K-120K" }, skills: ["S29_Writing", "K26_Sales_and_Marketing"] },
  { name: "CJ Worx", category: "DC", group: "Marketing", logo: "/logos/CJ Worx.png", salary: { fresh: "20K-35K", avg: "45K-100K" }, skills: ["A01_Artistic", "S19_Persuasion"] },
  { name: "GDH 559", category: "DC", group: "Film", logo: "/logos/GDH 559.png", salary: { fresh: "20K-30K", avg: "40K-90K" }, skills: ["K04_Communications_and_Media", "A01_Artistic"] },
  { name: "Yggdrazil Group", category: "DC", group: "Animation", logo: "/logos/Yggdrazil Group.png", salary: { fresh: "22K-35K", avg: "45K-95K" }, skills: ["A01_Artistic", "K07_Design"] },
  { name: "Adobe", category: "DC", group: "Digital Content", logo: "/logos/Adobe.png", salary: { fresh: "40K-60K", avg: "80K-160K" }, skills: ["K07_Design", "A01_Artistic"] },
];

/* ---- Group labels + 2-line role blurbs (the directory has no per-row desc) ---- */
const GROUP_META: Record<string, { th: string; en: string; blurbTh: string; blurbEn: string }> = {
  "Enterprise Software": { th: "ซอฟต์แวร์องค์กร", en: "Enterprise Software", blurbTh: "พัฒนาระบบซอฟต์แวร์ระดับองค์กรที่รองรับผู้ใช้จำนวนมาก เน้นความเสถียร ความปลอดภัย และการสเกล", blurbEn: "Builds enterprise software that serves millions of users, with a focus on reliability, security, and scale." },
  "Data Science": { th: "วิทยาการข้อมูล", en: "Data Science", blurbTh: "ใช้ข้อมูลและโมเดล AI เพื่อสกัดข้อมูลเชิงลึกและขับเคลื่อนการตัดสินใจขององค์กร", blurbEn: "Turns data and AI models into insight that drives real business decisions." },
  "Cloud Technology": { th: "คลาวด์", en: "Cloud Technology", blurbTh: "ออกแบบและดูแลโครงสร้างพื้นฐานคลาวด์ที่ยืดหยุ่นและปลอดภัยให้บริการระดับประเทศ", blurbEn: "Designs and runs flexible, secure cloud infrastructure at national scale." },
  "IT Support": { th: "ไอทีซัพพอร์ต", en: "IT Support", blurbTh: "ดูแลระบบและแก้ปัญหาเทคนิคให้ธุรกิจเดินหน้าได้ต่อเนื่องตลอดเวลา", blurbEn: "Keeps systems running and resolves technical issues so the business never stops." },
  "Web Application": { th: "เว็บแอปพลิเคชัน", en: "Web Application", blurbTh: "สร้างเว็บแอปที่รองรับทุกหน้าจอ ผสานการออกแบบและประสิทธิภาพการทำงานเข้าด้วยกัน", blurbEn: "Builds responsive web apps that pair clean design with strong performance." },
  "Digital Content": { th: "คอนเทนต์ดิจิทัล", en: "Digital Content", blurbTh: "ผลิตและกระจายคอนเทนต์ดิจิทัลที่เข้าถึงผู้ชมหลายล้านคนบนหลายแพลตฟอร์ม", blurbEn: "Produces and distributes digital content that reaches millions across platforms." },
  Film: { th: "ภาพยนตร์", en: "Film", blurbTh: "เล่าเรื่องผ่านภาพยนตร์และซีรีส์คุณภาพสูง ตั้งแต่บทจนถึงงานโพสต์โปรดักชัน", blurbEn: "Tells stories through high-quality film and series, from script to post-production." },
  Animation: { th: "แอนิเมชัน", en: "Animation", blurbTh: "สร้างงานแอนิเมชันและคาแรกเตอร์ที่ผสานศิลปะกับเทคโนโลยีการผลิตสมัยใหม่", blurbEn: "Creates animation and characters that fuse artistry with modern production tech." },
  Game: { th: "เกม", en: "Game", blurbTh: "ออกแบบและพัฒนาเกมที่ผู้เล่นทั่วโลกหลงใหล ตั้งแต่งานศิลป์จนถึงระบบเกมเพลย์", blurbEn: "Designs and builds games players love worldwide, from art to gameplay systems." },
  Marketing: { th: "การตลาด", en: "Marketing", blurbTh: "วางกลยุทธ์และผลิตแคมเปญที่สร้างผลลัพธ์จริงให้แบรนด์ชั้นนำของประเทศ", blurbEn: "Plans strategy and produces campaigns that deliver real results for top brands." },
};

const CATEGORY_ACCENT: Record<Category, string> = { DT: "#002F6C", DC: "#F39200" };

/* ---- Derive a 4-stage progression from the fresh→avg band ---- */
function parseBand(b: string): [number, number] {
  const m = b.replace(/\+/g, "").match(/(\d+)\s*K?\s*-\s*(\d+)\s*K?/i);
  return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : [0, 0];
}
const round5 = (n: number) => Math.round(n / 5) * 5;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function salaryStages(salary: { fresh: string; avg: string }, thai: boolean) {
  const [fl, fh] = parseBand(salary.fresh);
  const [al, ah] = parseBand(salary.avg);
  const band = (t: number, plus = false) =>
    `฿${round5(lerp(fl, al, t))}K-${round5(lerp(fh, ah, t))}K${plus ? "+" : ""}`;
  return [
    { label: thai ? "จบใหม่" : "Fresh", value: `฿${fl}K-${fh}K`, peak: false },
    { label: thai ? "2 ปี" : "2 Yrs", value: band(0.34), peak: false },
    { label: thai ? "5 ปี" : "5 Yrs", value: band(0.7), peak: false },
    { label: thai ? "10 ปี" : "10 Yrs", value: band(1, true), peak: true },
  ];
}

/* ---- Logo plate with graceful wordmark fallback ---- */
function LogoBox({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-white p-6 ring-1 ring-slate-100 md:h-56 md:w-1/3 dark:ring-white/10">
      {failed ? (
        <span className="text-center font-syne text-2xl font-extrabold tracking-tight text-[#002F6C]">{name}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </div>
  );
}

export default function CompanyDirectory() {
  const { lang } = useLanguage();
  const thai = lang === "th";
  const reduce = useReducedMotion();

  const [category, setCategory] = useState<Category>("DT");
  const [group, setGroup] = useState<string>("all");

  const groups = useMemo(
    () => [...new Set(companiesData.filter((c) => c.category === category).map((c) => c.group))],
    [category],
  );

  const filtered = useMemo(
    () => companiesData.filter((c) => c.category === category && (group === "all" || c.group === group)),
    [category, group],
  );

  const switchCategory = (next: Category) => {
    setCategory(next);
    setGroup("all");
  };

  const tabs: { id: Category; th: string; en: string }[] = [
    { id: "DT", th: "DT (Tech)", en: "DT (Tech)" },
    { id: "DC", th: "DC (Media)", en: "DC (Media)" },
  ];

  return (
    <section id="company-directory" className="relative overflow-hidden bg-white py-16 dark:bg-[#050a14] sm:py-20">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 size-96 rounded-full bg-[#F39200]/8 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-10 size-96 rounded-full bg-[#002F6C]/8 blur-[140px] dark:bg-[#1E90FF]/12" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section heading — the page hero above carries the H1; this labels the deep dive */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={`text-balance text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl ${thai ? "font-thai leading-snug" : "font-syne leading-tight"}`}>
            {thai ? "เจาะลึกบริษัทชั้นนำรายตัว" : "The leading employers, company by company"}
          </h2>
          <p className={`mx-auto mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg ${thai ? "font-thai leading-relaxed" : "leading-relaxed"}`}>
            {thai
              ? "สำรวจเส้นทางเติบโตและค่าตอบแทนจากบริษัทเทคฯ และมีเดียชั้นนำของประเทศ"
              : "Explore growth paths and compensation from the country's leading tech and media employers."}
          </p>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* DT / DC toggle */}
          <div role="tablist" aria-label={thai ? "เลือกสาย" : "Select track"} className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
            {tabs.map((tabItem) => {
              const active = category === tabItem.id;
              const accent = CATEGORY_ACCENT[tabItem.id];
              return (
                <button
                  key={tabItem.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchCategory(tabItem.id)}
                  className={`relative z-10 rounded-full px-5 py-2 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active ? "text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dir-pill"
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

          {/* Career group select (depends on the track) */}
          <div className="relative">
            <label htmlFor="career-group" className="sr-only">
              {thai ? "กลุ่มสายอาชีพ" : "Career group"}
            </label>
            <select
              id="career-group"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="h-11 w-full appearance-none rounded-full border border-slate-200 bg-white pl-5 pr-11 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-brand-orange/50 focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 sm:w-64"
            >
              <option value="all">{thai ? "กลุ่มสายอาชีพ: ทั้งหมด" : "Career group: All"}</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {thai ? GROUP_META[g]?.th ?? g : GROUP_META[g]?.en ?? g}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" strokeWidth={2.25} aria-hidden />
          </div>

          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {filtered.length} {thai ? "บริษัท" : "companies"}
          </span>
        </div>

        {/* Zig-zag company cards */}
        <div className="mt-12 flex flex-col gap-8">
          {filtered.map((c, i) => {
            const meta = GROUP_META[c.group];
            const stages = salaryStages(c.salary, thai);
            return (
              <motion.article
                key={c.name}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col items-center gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-[#0d1726] sm:p-8 md:gap-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <LogoBox src={c.logo} name={c.name} />

                <div className="w-full space-y-4 md:w-2/3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-syne text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{c.name}</h3>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        c.category === "DT"
                          ? "bg-[#002F6C]/10 text-[#002F6C] dark:bg-[#1E90FF]/15 dark:text-[#7FB0FF]"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-amber-300"
                      }`}
                    >
                      {c.category === "DT" ? "Tech" : "Media"}
                    </span>
                    <span className={`rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-300 ${thai ? "font-thai" : ""}`}>
                      {thai ? meta?.th ?? c.group : meta?.en ?? c.group}
                    </span>
                  </div>

                  <p className={`max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 ${thai ? "font-thai" : ""}`}>
                    {thai ? meta?.blurbTh : meta?.blurbEn}
                  </p>

                  {/* CARIA competencies screened — pill tags */}
                  <div className="flex flex-wrap gap-2">
                    {c.skills.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                      >
                        <span className="font-mono font-bold">{code.split("_")[0]}</span>
                        <span className={thai ? "font-thai" : ""}>{competencyLabel(code, thai)}</span>
                      </span>
                    ))}
                  </div>

                  {/* Salary progression — 4 metric boxes */}
                  <div>
                    <p className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${thai ? "font-thai" : ""}`}>
                      <TrendingUp className="size-3.5" strokeWidth={2.5} aria-hidden />
                      {thai ? "เส้นทางเงินเดือน (บาท/เดือน)" : "Salary progression (THB/mo)"}
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {stages.map((s) => (
                        <div
                          key={s.label}
                          className={`rounded-xl p-3 text-center ${
                            s.peak ? "bg-orange-50 dark:bg-orange-500/10" : "bg-slate-50 dark:bg-white/5"
                          }`}
                        >
                          <span
                            className={`block text-[10px] font-bold uppercase tracking-wider ${thai ? "font-thai" : ""} ${
                              s.peak ? "text-orange-700 dark:text-amber-300" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {s.label}
                          </span>
                          <span
                            className={`mt-1 block font-mono text-[13px] font-extrabold tabular-nums ${
                              s.peak ? "text-orange-700 dark:text-amber-300" : "text-slate-800 dark:text-slate-100"
                            }`}
                          >
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* CTA into the assessment */}
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <p className={`text-sm text-slate-500 dark:text-slate-400 ${thai ? "font-thai" : ""}`}>
            {thai ? "อยากรู้ว่าบริษัทไหนตรงกับทักษะคุณที่สุด?" : "Want to know which of these fit your skills best?"}
          </p>
          <Link
            href="/assessment"
            className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-orange px-8 py-3.5 text-base font-bold text-brand-orange-foreground shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100 ${thai ? "font-thai" : "font-syne"}`}
          >
            {thai ? "ทำแบบประเมินเพื่อจับคู่บริษัท" : "Take the assessment to match companies"}
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
