/**
 * CARIA-GAP Results Section — Precision Instrument UI
 * Design: Top 3 Career Cards with glass morphism, no solid orange backgrounds
 * Framer Motion: staggered 3D reveal, physics hover, glow border on hover
 */
"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { CareerRoadmapTimeline } from "@/components/results/CareerRoadmapTimeline";
import { Lock, Target, DollarSign, TrendingUp, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const CARD_BG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663715925716/C5srhVpvKrV4qWgj4NxM6w/career-card-bg-5L8EkNTMfS6jDs3zeQRXYj.webp";

const defaultCareers = [
  {
    rank: 1,
    title: "Data Scientist",
    match: null,
    department: null,
    skills: [],
    gaps: null,
    salary: null,
    trend: null,
    trendUp: true,
    color: "#F39200",
    description: null,
  },
  {
    rank: 2,
    title: "Cloud Architect",
    match: null,
    department: null,
    skills: [],
    gaps: null,
    salary: null,
    trend: null,
    trendUp: true,
    color: "#1E90FF",
    description: null,
  },
  {
    rank: 3,
    title: "Cybersecurity Analyst",
    match: null,
    department: null,
    skills: [],
    gaps: null,
    salary: null,
    trend: null,
    trendUp: true,
    color: "#A78BFA",
    description: null,
  },
];

const CAREER_DESCRIPTIONS: Record<string, { th: string; en: string }> = {
  DT08: {
    th: "ออกแบบ วิเคราะห์ และพัฒนาเว็บแอปพลิเคชันและระบบซอฟต์แวร์ เพื่อแก้โจทย์ปัญหาธุรกิจและเพิ่มประสิทธิภาพของกระบวนการทำงานดิจิทัล",
    en: "Design, analyze, and develop web applications and software systems to solve business problems and optimize digital processes."
  },
  DT18: {
    th: "ออกแบบและพัฒนาโมเดล ML เพื่อสกัดข้อมูลเชิงลึก ขับเคลื่อนการตัดสินใจขององค์กรและหลักสูตรการศึกษาด้วยข้อมูล",
    en: "Design and develop ML models to extract deep insights, driving data-driven organizational and academic decision-making."
  },
  DT26: {
    th: "ออกแบบสถาปัตยกรรมคลาวด์ที่ยืดหยุ่นและปลอดภัย ขับเคลื่อนระบบเครือข่ายและโครงสร้างพื้นฐานดิจิทัล",
    en: "Design flexible and secure cloud architectures, driving digital network systems and infrastructures."
  },
  DT31: {
    th: "เฝ้าระวัง ตรวจจับ และตอบสนองต่อภัยคุกคามความปลอดภัย ติดตั้งกลยุทธ์การป้องกันและตรวจสอบการปฏิบัติตามเกณฑ์มาตรฐาน",
    en: "Monitor, detect, and respond to security threats, establishing defense strategies and verifying standards compliance."
  },
  DT17: {
    th: "ออกแบบและพัฒนาท่อนำส่งข้อมูล (Data Pipeline) เพื่อจัดเก็บและประมวลผลข้อมูลขนาดใหญ่ในระบบวิเคราะห์ข้อมูล",
    en: "Design and develop data pipelines to store and process big data inside data analytics systems."
  },
  DT04: {
    th: "ออกแบบและพัฒนาเว็บแอปพลิเคชันที่รองรับการใช้งานทุกหน้าจอ (Responsive Web) ด้วยความปลอดภัยและประสิทธิภาพสูงสุด",
    en: "Design and develop responsive web applications with maximum security and performance."
  }
};

function getCareerDescription(id: string, name: string, group: string, isThai: boolean): string {
  if (!id && !name) return "";
  
  const matchId = id === "DT18" || name.toLowerCase().includes("data scientist") ? "DT18"
    : id === "DT26" || name.toLowerCase().includes("cloud architect") ? "DT26"
    : id === "DT31" || name.toLowerCase().includes("security") || name.toLowerCase().includes("cyber") ? "DT31"
    : id === "DT08" || name.toLowerCase().includes("software developer") ? "DT08"
    : id === "DT17" || name.toLowerCase().includes("data engineer") ? "DT17"
    : id === "DT04" || name.toLowerCase().includes("web developer") ? "DT04"
    : "";

  const mapped = CAREER_DESCRIPTIONS[matchId];
  if (mapped) {
    return isThai ? mapped.th : mapped.en;
  }

  const cleanGroup = group ? group.toLowerCase() : "";
  if (cleanGroup.includes("software") || cleanGroup.includes("web")) {
    return isThai 
      ? "ออกแบบและวิเคราะห์ระบบซอฟต์แวร์ วางโครงสร้างแอปพลิเคชันเพื่อแก้ปัญหาทางวิศวกรรมคอมพิวเตอร์และธุรกิจดิจิทัล"
      : "Design and analyze software systems, structuring applications to solve computer engineering and digital business problems.";
  }
  if (cleanGroup.includes("data") || cleanGroup.includes("ai")) {
    return isThai
      ? "ออกแบบและจัดการฐานข้อมูล จัดเตรียมท่อนำส่งประมวลผลข้อมูลระดับมหภาค และวิเคราะห์สถิติตลาดแรงงาน"
      : "Design and manage databases, preparing macro data pipelines and analyzing labor market stats.";
  }
  
  return isThai 
    ? `ออกแบบและบริหารจัดการโซลูชันในกลุ่มสายงาน ${group || ""} เพื่อขับเคลื่อนศักยภาพองค์กรด้วยเทคโนโลยีและความเชี่ยวชาญระดับสูง`
    : `Design and manage solutions in ${group || ""} to drive organizational capability with high technology and expertise.`;
}

function cleanTagName(tag: string, isThai: boolean): string {
  const clean = tag.replace(/^[SKA]\d+_(Group_)?/, '').replace(/_/g, ' ');
  
  const thMap: Record<string, string> = {
    "Programming": "เขียนโปรแกรม",
    "Complex Problem Solving": "แก้ปัญหาซับซ้อน",
    "Technology Design": "ออกแบบเทคโนโลยี",
    "Negotiation": "การเจรจาต่อรอง",
    "Sales and Marketing": "การขายและการตลาด",
    "Persuasion": "การโน้มน้าวใจ",
    "Design": "การออกแบบ",
    "Mathematics": "คณิตศาสตร์",
    "Systems Analysis": "วิเคราะห์ระบบ",
    "Artistic": "ศิลปะและความสร้างสรรค์",
    "Fine Arts": "วิจิตรศิลป์",
    "Critical Thinking": "การคิดเชิงวิพากษ์",
    "Troubleshooting": "การแก้ปัญหาเทคนิค",
    "Quality Control Analysis": "ควบคุมตรวจสอบคุณภาพ",
    "Systems Design": "ออกแบบระบบ",
    "Management of Financial Resources": "การบริหารเงินทุน",
    "Economics and Accounting": "เศรษฐศาสตร์และบัญชี",
    "Communications and Media": "สื่อและการสื่อสาร",
    "Psychology": "จิตวิทยา",
    "Administration and Management": "การบริหารการจัดการ"
  };

  if (isThai && thMap[clean]) {
    return thMap[clean];
  }
  return clean;
}

function CareerCard({
  career,
  index,
  hasAssessmentResult,
  onClick
}: {
  career: any;
  index: number;
  hasAssessmentResult: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const cardRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -6]);
  const cardScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.98]);
  const { t, lang } = useLanguage();
  const thai = lang === "th";
  const router = useRouter();

  const isTop = career.rank === 1 && hasAssessmentResult;

  // Safe formatting checks
  const salaryDisplay = career.salary || "-";
  const demandDisplay = career.trend ? career.trend.split(" ")[0] : "-";
  const gapDisplay = career.gaps !== null && career.gaps !== undefined ? `${career.gaps} ทักษะ` : "-";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80, rotateX: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 45, damping: 15, duration: 1.0, delay: index * 0.12 }}
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      className={`relative h-full ${isTop ? "lg:-mt-4 lg:mb-4" : ""}`}
    >
      <motion.div
        onClick={onClick}
        className={cn(
          "relative rounded-3xl overflow-hidden h-full border bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl transition-all duration-300 group flex flex-col p-8 sm:p-9 cursor-pointer justify-between min-h-[480px]",
          hasAssessmentResult
            ? isTop
              ? "border-[#F39200]/30 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(243,146,0,0.12),0_20px_60px_rgba(0,0,0,0.45)]"
              : "border-slate-200/80 dark:border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            : "border-slate-200/50 dark:border-white/5 opacity-60 shadow-sm"
        )}
        style={{
          rotateX: cardRotateX,
          scale: cardScale,
        }}
        whileHover={hasAssessmentResult ? {
          y: -8,
          borderColor: `${career.color}50`,
          boxShadow: `0 20px 40px rgba(0,0,0,0.06), 0 0 50px ${career.color}15`,
        } : {
          y: -4,
          borderColor: "rgba(243,146,0,0.2)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Card BG texture */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: `url(${CARD_BG_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: hasAssessmentResult
              ? `linear-gradient(90deg, transparent, ${career.color}, transparent)`
              : `linear-gradient(90deg, transparent, rgba(148,163,184,0.15), transparent)`
          }}
        />

        {!hasAssessmentResult ? (
          /* LOCKED / PENDING STATE — prototype awaiting input */
          <div className="flex h-full w-full flex-col py-2">
            {/* Prototype badge */}
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-100/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                <span className="size-1.5 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden />
                {thai ? "ตัวอย่าง · รอข้อมูล" : "Prototype · awaiting input"}
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
                <Lock className="size-4" strokeWidth={2.25} aria-hidden />
              </div>
            </div>

            {/* Skeleton placeholders — signal "this fills after the assessment" */}
            <div className="space-y-3" aria-hidden>
              <div className="h-6 w-3/4 rounded-lg bg-slate-100 dark:bg-white/5" />
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-white/5" />
                ))}
              </div>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {thai
                ? "การ์ดนี้จะแสดงอาชีพที่ตรงกับคุณ พร้อมคะแนนจับคู่และช่องว่างทักษะ หลังทำแบบประเมิน"
                : "This card fills with your matched career, match score, and skill gaps after the assessment."}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/assessment");
              }}
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange px-5 py-3.5 text-center text-[13px] font-bold leading-snug text-brand-orange-foreground shadow-md transition-transform duration-300 hover:scale-[1.01] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              {thai
                ? "🔒 ล็อกอยู่: ทำแบบทดสอบ Hybrid 3 นาทีเพื่อปลดล็อกผลลัพธ์ (Take Assessment to Unlock)"
                : "🔒 Locked: Take the 3-min Hybrid assessment to unlock results"}
            </button>
          </div>
        ) : (
          /* FILLED STATE */
          <>
            <div>
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-3.5">
                  {/* Rank badge */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-syne font-black text-sm shrink-0 border"
                    style={{
                      background: `${career.color}12`,
                      borderColor: `${career.color}35`,
                      color: career.color,
                      boxShadow: `0 0 12px ${career.color}15`,
                    }}
                  >
                    #{career.rank}
                  </div>
                  <div className="min-w-0">
                    <span className="inline-flex bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1.5">
                      {career.department || "-"}
                    </span>
                    <h3 className="text-slate-800 dark:text-white text-xl sm:text-2xl leading-snug font-extrabold tracking-tight font-syne text-balance">
                      {career.title || "-"}
                    </h3>
                  </div>
                </div>

                {/* Match score display */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="font-syne font-black text-3xl sm:text-4xl bg-linear-to-r from-[#F39200] to-orange-400 bg-clip-text text-transparent">
                    {career.match !== null && career.match !== undefined ? `${career.match}%` : "-"}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mt-0.5">
                    {thai ? "คะแนนจับคู่" : "Match Score"}
                  </div>
                </div>
              </div>

              {/* Match progress bar */}
              <div className="mb-6">
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${career.color}80, ${career.color})`
                    }}
                    initial={{ width: "0%" }}
                    animate={inView ? { width: `${career.match || 0}%` } : { width: "0%" }}
                    transition={{ duration: 1.2, delay: 0.3 + index * 0.12, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Description */}
              <p className={cn(
                "text-sm mb-6 font-medium text-balance min-h-[64px] text-slate-600 dark:text-slate-350",
                thai ? "font-thai leading-relaxed" : "font-dm leading-relaxed"
              )}>
                {thai 
                  ? getCareerDescription(career.title.toLowerCase().includes("data scientist") ? "DT18" : career.title.toLowerCase().includes("cloud") ? "DT26" : "DT31", career.title, career.department, true) 
                  : career.description || "-"
                }
              </p>

              {/* Skills Badges */}
              <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
                {career.skills && career.skills.length > 0 ? (
                  career.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/8"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )}
              </div>
            </div>

            {/* Compartmentalized Stats & CTA */}
            <div>
              {/* 3-Column Compartment Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center border-t border-slate-100 dark:border-white/5 pt-6">
                {/* 1. Gaps */}
                <div className="bg-slate-50 dark:bg-white/1 p-2.5 rounded-2xl border border-slate-200/40 dark:border-white/3 flex flex-col justify-center items-center min-h-[60px]">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-white/30 flex items-center justify-center gap-1 leading-normal shrink-0">
                    <Target className="size-3 text-brand-orange" />
                    {thai ? "ทักษะที่ขาด" : "Skills Gap"}
                  </span>
                  <span className="block mt-1 font-syne text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-none">
                    {gapDisplay}
                  </span>
                </div>
                {/* 2. Salary */}
                <div className="bg-slate-50 dark:bg-white/1 p-2.5 rounded-2xl border border-slate-200/40 dark:border-white/3 flex flex-col justify-center items-center min-h-[60px]">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-white/30 flex items-center justify-center gap-1 leading-normal shrink-0">
                    <DollarSign className="size-3 text-slate-400 dark:text-white/40" />
                    {thai ? "เงินเดือนแรกเข้า" : "Salary Range"}
                  </span>
                  <span className="block mt-1 font-syne text-[10px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-300 leading-none truncate max-w-full">
                    {salaryDisplay}
                  </span>
                </div>
                {/* 3. Trend */}
                <div className="bg-slate-50 dark:bg-white/1 p-2.5 rounded-2xl border border-slate-200/40 dark:border-white/3 flex flex-col justify-center items-center min-h-[60px]">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-white/30 flex items-center justify-center gap-1 leading-normal shrink-0">
                    <TrendingUp className="size-3 text-emerald-500" />
                    {thai ? "การเติบโต" : "Demand"}
                  </span>
                  <span className="block mt-1 font-syne text-xs sm:text-sm font-extrabold text-emerald-500 leading-none">
                    {demandDisplay}
                  </span>
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="mt-6">
                <button
                  className="w-full py-3.5 px-4 rounded-2xl text-center text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.01] active:scale-[0.99] shadow-sm select-none bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white border border-slate-200/50 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  <span>{thai ? "วิเคราะห์และวางแผนแผนการเรียน" : "Analyze & Plan Learning Roadmap"}</span>
                  <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Top 1 badge */}
      {isTop && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3.5 py-1 font-syne text-[10px] font-black uppercase tracking-[0.18em] text-[#1a1100] shadow-md shadow-[#F39200]/15"
          style={{
            background: "linear-gradient(135deg, #F39200, #FFB84D)",
          }}
        >
          <Star className="size-3 fill-current" strokeWidth={2.5} aria-hidden />
          TOP MATCH
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ResultsSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const { t, lang } = useLanguage();
  const thai = lang === "th";
  const router = useRouter();

  const [hasAssessmentResult, setHasAssessmentResult] = useState(false);
  const [userCareers, setUserCareers] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("caria_top10");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.top10_careers && parsed.top10_careers.length > 0) {
            setHasAssessmentResult(true);
            
            // Map parsed careers to the schema used in ResultsSection
            const mapped = parsed.top10_careers.slice(0, 3).map((c: any, index: number) => {
              const colors = ["#F39200", "#1E90FF", "#A78BFA"];
              const isDT = c.program === 'DT';
              const salary = isDT ? '฿35K–65K' : '฿25K–45K';
              
              let demand = '+10% YoY';
              if (c.match_percentage >= 92) demand = '+22% YoY';
              else if (c.match_percentage >= 85) demand = '+16% YoY';
              else if (c.match_percentage >= 75) demand = '+12% YoY';

              // Decode strengths
              const strengths = c.top_strengths ? c.top_strengths.map((s: string) => cleanTagName(s, lang === 'th')) : [];
              const fallbackSkills = isDT 
                ? ["Programming", "Software Architecture", "Data Viz"]
                : ["Creative Design", "Branding", "UI/UX Layout"];
              
              return {
                rank: c.rank || (index + 1),
                title: c.career_name,
                match: Math.round(c.match_percentage),
                department: c.career_group,
                skills: strengths.length > 0 ? strengths.slice(0, 3) : fallbackSkills,
                gaps: c.top_gaps ? c.top_gaps.length : 3,
                salary: salary,
                trend: demand,
                trendUp: true,
                color: colors[index % colors.length],
                description: getCareerDescription(c.career_id, c.career_name, c.career_group, lang === 'th')
              };
            });
            setUserCareers(mapped);
          }
        } catch (e) {
          console.error("Error parsing caria_top10 in ResultsSection", e);
        }
      }
    }
  }, [lang]);

  const displayedCareers = hasAssessmentResult ? userCareers : defaultCareers;

  const handleCardClick = () => {
    if (hasAssessmentResult) {
      router.push("/dashboard");
    } else {
      router.push("/assessment");
    }
  };

  return (
    <section id="results" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#050A14]">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(243,146,0,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F39200]/20 bg-[#F39200]/5 mb-5">
            <div className="w-2 h-2 rounded-full bg-[#F39200] animate-pulse" />
            <span className={`text-xs text-[#F39200] ${thai ? "font-thai font-semibold" : "font-dm tracking-widest uppercase"}`}>
              {t.results.eyebrow}
            </span>
          </div>
          <h2 className={`font-extrabold text-4xl lg:text-5xl text-foreground mb-4 ${thai ? "font-thai leading-snug" : "font-syne"}`}>
            {t.results.title}
          </h2>
          <p className={`text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed ${thai ? "font-thai" : "font-dm"}`}>
            {t.results.subtitle}
          </p>
        </motion.div>

        {/* Career Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {displayedCareers.map((career, i) => (
            <CareerCard 
              key={career.rank} 
              career={career} 
              index={i} 
              hasAssessmentResult={hasAssessmentResult}
              onClick={handleCardClick}
            />
          ))}
        </div>

        {/* Timeline */}
        <CareerRoadmapTimeline />
      </div>
    </section>
  );
}
