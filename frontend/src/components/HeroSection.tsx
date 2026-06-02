/**
 * CARIA-GAP Hero Section — Precision Instrument UI
 * Design: Full-bleed dark canvas, animated neural orb, bold Syne typography
 * Colors: #050A14 bg | #F39200 accent | #1E90FF secondary
 */
"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Zap, X } from "lucide-react";
import { DT_BRANCH, DC_BRANCH, getGroupSlug } from "@/lib/careers-list";
import mockCareers from "@/lib/mock_careers.json";

const InteractiveCareerSphere = dynamic(
  () => import("@/components/InteractiveCareerSphere"),
  {
    ssr: false,
    loading: () => (
      <div className="w-[380px] h-[380px] lg:w-[440px] lg:h-[440px] rounded-full bg-white/1 border border-white/5 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F39200]/30 border-t-[#F39200] animate-spin" />
      </div>
    ),
  }
);

const HERO_ORB_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663715925716/C5srhVpvKrV4qWgj4NxM6w/hero-orb-CqVHLGvLZ2Mq825NTHYLoH.webp";

const stats = [
  { value: "66", label: "Competencies Mapped", unit: "" },
  { value: "95", label: "Match Accuracy", unit: "%" },
  { value: "3", label: "Career Pathways", unit: "×" },
];

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [isExploring, setIsExploring] = useState(false);

  // Helper to map career name to ID from mock_careers.json
  const getCareerIdForAssessment = (careerName: string, branch: "DT" | "DC") => {
    if (!careerName) return "";
    const prog = branch === "DT" ? "DT" : "DM";
    
    // Find exact or partial match
    let found = mockCareers.find(
      (c: any) => c.program === prog && c.career_name.toLowerCase() === careerName.toLowerCase()
    );
    if (!found) {
      found = mockCareers.find(
        (c: any) => c.program === prog && c.career_name.toLowerCase().includes(careerName.toLowerCase())
      );
    }
    if (!found) {
      found = mockCareers.find(
        (c: any) => c.program === prog && careerName.toLowerCase().includes(c.career_name.toLowerCase())
      );
    }
    if (!found) {
      found = mockCareers.find(
        (c: any) => c.career_name.toLowerCase().includes(careerName.toLowerCase())
      );
    }
    return found ? found.career_id : "";
  };
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeBranch, setActiveBranch] = useState<"DT" | "DC">("DT");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedCareer, setSelectedCareer] = useState<string>("");

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (isExploring && !selectedGroup) {
      const defaultGroup = activeBranch === "DT" ? DT_BRANCH[0].name : DC_BRANCH[0].name;
      setSelectedGroup(defaultGroup);
      const grp = activeBranch === "DT" ? DT_BRANCH[0] : DC_BRANCH[0];
      if (grp && grp.careers.length > 0) {
        setSelectedCareer(grp.careers[0].name);
      }
    }
  }, [isExploring, activeBranch, selectedGroup]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const { t, lang } = useLanguage();
  const thai = lang === "th";

  const panelTexts = {
    title: thai ? "เลือกสายงานที่สนใจ" : "Select Your Career Path",
    dtLabel: thai ? "สาย DT (Technology)" : "DT (Technology)",
    dcLabel: thai ? "สาย DC (Media)" : "DC (Media)",
    branchHeaderDT: "DT - DIGITAL TECHNOLOGY",
    branchHeaderDC: "DC - DIGITAL COMMUNICATIONS & MEDIA",
    groupSelectLabel: thai ? "เปลี่ยนกลุ่มสายงานหลักที่นี่" : "Change Main Career Group",
    listHeader: thai ? "อาชีพย่อยภายใต้กลุ่มสายงานนี้:" : "Sub-careers under this group:",
    viewCoursesCTA: thai ? "ดูแผนการเรียนและวิชาบังคับเรียน →" : "View Study Plan & Courses →",
    noSubCareers: thai ? "ไม่มีอาชีพย่อยในกลุ่มนี้" : "No sub-careers in this group",
  };

  const activeGroupObj = (activeBranch === "DT" ? DT_BRANCH : DC_BRANCH).find(
    (g) => g.name === selectedGroup
  );

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#f4f7fc] dark:bg-[#030712]"
    >
      {/* Dark-mode cinematic base */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background: "radial-gradient(ellipse 95% 85% at 72% 45%, #0A1422 0%, #050A14 45%, #030712 100%)",
        }}
      />
      {/* Light-mode airy base */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          background: "radial-gradient(ellipse 95% 85% at 72% 45%, #ffffff 0%, #eef3fb 55%, #e6edf8 100%)",
        }}
      />
      {/* Cool glow behind the 3D nexus (right) — works on both themes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 55% 60% at 74% 48%, rgba(45,156,255,0.12) 0%, transparent 65%)",
        }}
      />
      {/* Warm glow behind the headline (left) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 45% 55% at 18% 42%, rgba(243,146,0,0.10) 0%, transparent 68%)",
        }}
      />

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(30,144,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(30,144,255,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            style={{ y: textY, opacity: isExploring ? undefined : opacity }}
            animate={isExploring ? { y: isDesktop ? -30 : 0, scale: 1, originX: 0 } : { y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className={`relative flex flex-col gap-6 z-30 max-w-2xl ${
              isExploring ? "pointer-events-none" : "pointer-events-auto"
            }`}
          >
            {/* Back button */}
            {isExploring && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setIsExploring(false)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white pointer-events-auto self-start px-3.5 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur shadow-sm hover:shadow transition-all"
              >
                <span>← {thai ? "ย้อนกลับหน้าหลัก" : "Back to Main"}</span>
              </motion.button>
            )}

            {/* Badge */}
            <AnimatePresence>
              {!isExploring && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full border border-[#F39200]/30 bg-[#F39200]/5"
                >
                  <div className="w-2 h-2 rounded-full bg-[#F39200] animate-pulse" />
                  <span className={`text-xs text-[#F39200] ${thai ? "font-thai" : "font-dm tracking-widest uppercase"}`}>
                    {t.hero.badge}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Headline */}
            <motion.h1
              layout
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className={`font-extrabold tracking-tight text-slate-900 dark:text-white transition-all duration-300 ${
                thai ? "font-thai" : "font-syne"
              } ${
                isExploring
                  ? "text-4xl sm:text-5xl md:text-6xl lg:text-6xl leading-snug"
                  : `text-5xl sm:text-6xl md:text-7xl lg:text-8xl ${thai ? "leading-snug" : "leading-[1.1]"}`
              }`}
            >
              {t.hero.line1}
              <br />
              <span className="text-[#F39200]">{t.hero.accent}</span>
              <br />
              {t.hero.line3}
            </motion.h1>

            {/* Subheading, CTAs & Stats */}
            <AnimatePresence>
              {!isExploring && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 15 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex flex-col gap-6 overflow-hidden"
                >
                  {/* Subheading */}
                  <p className={`text-slate-600 dark:text-slate-300 text-lg sm:text-xl md:text-2xl max-w-2xl ${
                    thai ? "font-thai leading-loose" : "font-dm leading-relaxed"
                  }`}>
                    {t.hero.sub}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-4 items-center pt-2">
                    <motion.a
                      href="#assessment"
                      className="flex items-center gap-2 px-8 py-4 rounded-full bg-[#F39200] text-[#050A14] font-syne font-bold text-base tracking-wide"
                      style={{ boxShadow: "0 0 30px rgba(243,146,0,0.4), 0 4px 20px rgba(0,0,0,0.3)" }}
                      whileHover={{ scale: 1.04, boxShadow: "0 0 45px rgba(243,146,0,0.6), 0 4px 24px rgba(0,0,0,0.4)" }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <span>{t.hero.ctaPrimary}</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.a>

                    <motion.a
                      href="#how-it-works"
                      className="flex items-center gap-2 px-8 py-4 rounded-full border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 dark:border-white/15 dark:text-white/70 dark:hover:text-white dark:hover:border-white/30 font-dm text-base transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {t.hero.ctaSecondary}
                    </motion.a>
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-8 pt-6 border-t border-slate-200 dark:border-white/8 mt-2">
                    {stats.map((stat, i) => (
                      <div key={stat.label} className="flex flex-col gap-1">
                        <div className="font-syne font-extrabold text-2xl text-slate-900 dark:text-white">
                          {stat.value}
                          <span className="text-[#F39200]">{stat.unit}</span>
                        </div>
                        <div className={`text-xs text-slate-500 dark:text-white/40 tracking-wide ${thai ? "font-thai" : "font-dm"}`}>
                          {t.hero.stats[i].label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Neural Orb / Sphere wrapper */}
          <motion.div
            style={{ y: orbY, scale: orbScale }}
            className="relative flex items-center justify-center h-[500px] lg:h-[800px] w-full"
          >
            <motion.div
              animate={isExploring 
                ? { 
                    scale: isDesktop ? 1.05 : 0.8, 
                    x: isDesktop ? -520 : 0, 
                    y: isDesktop ? 40 : 220,
                    opacity: isDesktop ? (isDark ? 0.45 : 0.22) : (isDark ? 0.35 : 0.18)
                  } 
                : { 
                    scale: 1, 
                    x: 0, 
                    y: 0,
                    opacity: isDark ? 1 : 0.85
                  }
              }
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
              className="absolute top-1/2 right-[-60%] lg:right-[-45%] xl:right-[-55%] -translate-y-1/2 w-[1000px] h-[1000px] pointer-events-auto flex items-center justify-center opacity-40 lg:opacity-100 z-10"
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute w-[720px] h-[720px] rounded-full hidden lg:block"
                style={{
                  background: "radial-gradient(circle, rgba(243,146,0,0.06) 0%, transparent 70%)",
                  border: "1px solid rgba(243,146,0,0.1)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-[580px] h-[580px] rounded-full hidden lg:block"
                style={{
                  border: "1px solid rgba(30,144,255,0.15)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />

              {/* Interactive 3D Career Sphere */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <InteractiveCareerSphere 
                  isExploring={isExploring}
                  setIsExploring={setIsExploring}
                  activeBranch={activeBranch}
                  setActiveBranch={setActiveBranch}
                  selectedGroup={selectedGroup}
                  setSelectedGroup={setSelectedGroup}
                  selectedCareer={selectedCareer}
                  setSelectedCareer={setSelectedCareer}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Dynamic explorer panel */}
        <AnimatePresence>
          {isExploring && (
            <motion.div
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="absolute top-28 bottom-16 right-4 w-[calc(100%-2rem)] sm:w-[380px] lg:w-[410px] xl:w-[430px] z-30 pointer-events-auto bg-white/70 dark:bg-[#070b14]/40 backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col"
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest ${thai ? "font-thai" : "font-dm"}`}>
                  {panelTexts.title}
                </span>
                <button
                  type="button"
                  onClick={() => setIsExploring(false)}
                  aria-label={thai ? "ปิด" : "Close"}
                  className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white/50 text-slate-500 transition-colors hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="size-4" strokeWidth={2.5} aria-hidden />
                </button>
              </div>

              {/* Branch Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 mt-4">
                <button
                  onClick={() => {
                    setActiveBranch("DT");
                    const defaultGroup = DT_BRANCH[0].name;
                    setSelectedGroup(defaultGroup);
                    setSelectedCareer(DT_BRANCH[0].careers[0]?.name || "");
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                    activeBranch === "DT"
                      ? "bg-[#2563EB] text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {panelTexts.dtLabel}
                </button>
                <button
                  onClick={() => {
                    setActiveBranch("DC");
                    const defaultGroup = DC_BRANCH[0].name;
                    setSelectedGroup(defaultGroup);
                    setSelectedCareer(DC_BRANCH[0].careers[0]?.name || "");
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                    activeBranch === "DC"
                      ? "bg-[#F39200] text-[#050A14] shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {panelTexts.dcLabel}
                </button>
              </div>

              {/* Group display header */}
              <div className="mt-5">
                <div className="text-[10px] tracking-widest text-[#F39200] dark:text-amber-400 font-extrabold uppercase">
                  {activeBranch === "DT" ? panelTexts.branchHeaderDT : panelTexts.branchHeaderDC}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight mt-1">
                  {selectedGroup}
                </h3>
              </div>

              {/* Dropdown to change main group */}
              <div className="mt-4 flex flex-col gap-1.5">
                <label className={`text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider ${thai ? "font-thai" : ""}`}>
                  {panelTexts.groupSelectLabel}
                </label>
                <div className="relative">
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      const groupName = e.target.value;
                      setSelectedGroup(groupName);
                      const grp = (activeBranch === "DT" ? DT_BRANCH : DC_BRANCH).find(g => g.name === groupName);
                      if (grp && grp.careers.length > 0) {
                        setSelectedCareer(grp.careers[0].name);
                      }
                    }}
                    className="w-full appearance-none bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl pl-4 pr-10 py-3 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500/50 dark:focus:border-blue-400/50 transition-all font-semibold cursor-pointer"
                  >
                    {(activeBranch === "DT" ? DT_BRANCH : DC_BRANCH).map((g) => (
                      <option key={g.name} value={g.name} className="bg-white dark:bg-[#0c1220] text-slate-800 dark:text-white">
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <Link
                href={`/assessment?career=${getCareerIdForAssessment(selectedCareer || activeGroupObj?.careers[0]?.name || "", activeBranch)}`}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-transparent px-5 py-3 text-xs font-bold shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                  activeBranch === "DT"
                    ? "bg-[#002F6C] text-white hover:bg-[#0a3f80] hover:shadow-lg hover:shadow-[#002F6C]/30"
                    : "bg-[#F39200] text-[#050A14] hover:bg-[#d88200] hover:shadow-lg hover:shadow-brand-orange/30"
                }`}
              >
                <Zap className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className={thai ? "font-thai text-[10px] font-bold leading-relaxed" : "font-syne text-[10px] font-bold"}>
                  {thai
                    ? `พิสูจน์ DNA ของคุณว่าเหมาะกับสาย ${selectedGroup} หรือไม่? (Start Assessment)`
                    : `Prove if you fit the ${selectedGroup} path (Start Assessment)`}
                </span>
              </Link>

              {/* List Header */}
              <div className={`text-[10px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider mt-6 ${thai ? "font-thai" : ""}`}>
                {panelTexts.listHeader}
              </div>

              {/* Scrollable careers list */}
              <div className="flex-1 min-h-0 overflow-y-auto mt-2 pr-1 scrollbar-thin flex flex-col gap-2">
                {activeGroupObj?.careers.map((career) => {
                  const isExpanded = selectedCareer === career.name;
                  return (
                    <div
                      key={career.name}
                      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? "bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/20 shadow-md"
                          : "bg-transparent border-slate-200/50 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/2 cursor-pointer"
                      }`}
                      onClick={() => setSelectedCareer(isExpanded ? "" : career.name)}
                    >
                      {/* Career Row */}
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-800 dark:text-white">
                            {career.name}
                          </span>
                          {thai && career.nameTh && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-thai mt-0.5 leading-relaxed">
                              {career.nameTh}
                            </span>
                          )}
                        </div>
                        {/* Chevron */}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
                        >
                          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      {/* Expanded description */}
                      {isExpanded && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="px-6 pb-6 pt-3.5 border-t border-slate-200/50 dark:border-white/5">
                          <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed ${thai ? "font-thai" : ""}`}>
                            {thai ? career.description : (career.descriptionEn || career.description)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!activeGroupObj || activeGroupObj.careers.length === 0) && (
                  <div className="text-center py-6 text-xs text-slate-500">
                    {panelTexts.noSubCareers}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      {!isExploring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-dm text-slate-400 dark:text-white/30 tracking-widest uppercase">Scroll</span>
          <motion.div
            className="w-px h-8 bg-linear-to-b from-slate-400 dark:from-white/30 to-transparent"
            animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </section>
  );
}
