'use client';

import type { CareerResult } from '@/types';
import type { SutTrack } from '@/lib/sut-tracks';
import { cn } from '@/lib/utils';
import { ChevronRight, Star, Target, DollarSign, TrendingUp, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useLanguage } from '@/components/language-provider';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CareerCardProps {
  career: CareerResult;
  isTopRank?: boolean;
  isHero?: boolean;
  /** Optional SUT curriculum track chip (funnel tag). */
  track?: SutTrack;
  onClick?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Career Description Mock Data                                        */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function programBadge(program: string): string {
  if (program === 'DT') {
    return 'bg-[#F39200]/10 text-[#F39200] dark:bg-[#F39200]/20 border border-[#F39200]/20';
  }
  return 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 border border-[#2563EB]/20';
}

function rankGradient(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-linear-to-b from-amber-400 to-yellow-300 bg-clip-text text-transparent';
    case 2:
      return 'bg-linear-to-b from-gray-300 to-gray-400 bg-clip-text text-transparent';
    case 3:
      return 'bg-linear-to-b from-amber-600 to-amber-700 bg-clip-text text-transparent';
    default:
      return 'text-slate-400 dark:text-white/40';
  }
}

function matchColor(pct: number): string {
  if (pct >= 85) return '#10B981'; // Emerald
  if (pct >= 70) return '#F39200'; // SUT Orange
  return '#FFB54D';
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CareerCard({ career, isTopRank, isHero, track, onClick, className }: CareerCardProps) {
  const { lang } = useLanguage();
  const thai = lang === 'th';
  const TrackIcon = track?.Icon;
  const { rank, career_id, career_name, career_group, program, match_percentage, top_strengths, top_gaps } =
    career;

  // Generate dynamic descriptions based on ID or Group
  const desc = useMemo(() => {
    const matchId = career_id === "DT18" || career_name.toLowerCase().includes("data scientist") ? "DT18"
      : career_id === "DT26" || career_name.toLowerCase().includes("cloud architect") ? "DT26"
      : career_id === "DT31" || career_name.toLowerCase().includes("security") || career_name.toLowerCase().includes("cyber") ? "DT31"
      : career_id === "DT08" || career_name.toLowerCase().includes("software developer") ? "DT08"
      : career_id === "DT17" || career_name.toLowerCase().includes("data engineer") ? "DT17"
      : career_id === "DT04" || career_name.toLowerCase().includes("web developer") ? "DT04"
      : "";

    const mapped = CAREER_DESCRIPTIONS[matchId];
    if (mapped) {
      return thai ? mapped.th : mapped.en;
    }

    if (career_group.toLowerCase().includes("software") || career_group.toLowerCase().includes("web")) {
      return thai 
        ? "ออกแบบและวิเคราะห์ระบบซอฟต์แวร์ วางโครงสร้างแอปพลิเคชันเพื่อแก้ปัญหาทางวิศวกรรมคอมพิวเตอร์และธุรกิจดิจิทัล"
        : "Design and analyze software systems, structuring applications to solve computer engineering and digital business problems.";
    }
    if (career_group.toLowerCase().includes("data") || career_group.toLowerCase().includes("ai")) {
      return thai
        ? "ออกแบบและจัดการฐานข้อมูล จัดเตรียมท่อนำส่งประมวลผลข้อมูลระดับมหภาค และวิเคราะห์สถิติตลาดแรงงาน"
        : "Design and manage databases, preparing macro data pipelines and analyzing labor market stats.";
    }
    
    return thai 
      ? `ออกแบบและบริหารจัดการโซลูชันในกลุ่มสายงาน ${career_group} เพื่อขับเคลื่อนศักยภาพองค์กรด้วยเทคโนโลยีและความเชี่ยวชาญระดับสูง`
      : `Design and manage solutions in ${career_group} to drive organizational capability with high technology and expertise.`;
  }, [career_id, career_name, career_group, thai]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const isDT = program === 'DT';
    const salary = isDT ? '฿35k - ฿65k' : '฿25k - ฿45k';
    
    let demand = '+10% YoY';
    if (match_percentage >= 92) demand = '+22% YoY';
    else if (match_percentage >= 85) demand = '+16% YoY';
    else if (match_percentage >= 75) demand = '+12% YoY';
    
    const gapVal = `${(100 - match_percentage).toFixed(0)}%`;

    return {
      gap: gapVal,
      salary,
      demand,
    };
  }, [program, match_percentage]);

  const size = isHero ? 96 : isTopRank ? 68 : 60;
  const strokeWidth = isHero ? 6 : 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const offset = useMemo(
    () => circumference - (match_percentage / 100) * circumference,
    [circumference, match_percentage],
  );

  const strokeColor = matchColor(match_percentage);

  // Framer Motion entrance animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={onClick}
      className={cn(
        'bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group relative',
        isHero
          ? 'p-8 lg:col-span-2 shadow-[0_0_50px_rgba(243,146,0,0.12)] border-[#F39200]/25 dark:border-[#F39200]/30'
          : 'p-6 shadow-xl hover:shadow-2xl border-slate-200/80 dark:border-white/5',
        className,
      )}
    >
      {/* Decorative gradient glow on Hero Card */}
      {isHero && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#F39200]/15 blur-3xl"
        />
      )}

      {/* TOP MATCH Badge from Design Image */}
      {isHero && rank === 1 && (
        <div className="absolute -top-3 left-6 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-3 py-1 font-syne text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md shadow-brand-orange/20 animate-pulse-glow">
            <Star className="size-3" fill="currentColor" />
            <span>TOP MATCH</span>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      {isHero ? (
        <div className="md:grid md:grid-cols-12 md:gap-8 h-full">
          {/* Left info column */}
          <div className="md:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3.5">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-black leading-none tracking-tight text-4xl bg-linear-to-b from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    {rank}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {track && TrackIcon && (
                    <span
                      className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `${track.accent}1a`, color: track.accent }}
                    >
                      <TrackIcon className="size-3" strokeWidth={2.5} aria-hidden />
                      {thai ? track.labelTh : track.labelEn}
                    </span>
                  )}
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {career_group}
                  </span>
                  <span className={cn('text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider', programBadge(program))}>
                    {program}
                  </span>
                </div>
              </div>

              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-relaxed text-balance text-2xl sm:text-3xl">
                {career_name}
              </h3>
            </div>

            {/* Colored Match fit progress line indicator */}
            <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-3.5 mb-4">
              <div 
                className="h-full rounded-full bg-linear-to-r from-[#F39200] to-[#FFB54D]"
                style={{ width: `${match_percentage}%` }}
              />
            </div>

            {/* Thai/English description paragraph */}
            <p className="text-sm leading-relaxed text-slate-600 dark:text-white/60 mb-5 font-medium font-thai">
              {desc}
            </p>

            {/* Sleek Skill Badge Pill Tags */}
            <div className="flex flex-wrap gap-2">
              {top_strengths.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-3 py-1 rounded-full font-medium transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{cleanTagName(s, thai)}</span>
                </span>
              ))}
              {top_gaps.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-3 py-1 rounded-full font-medium transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span>{cleanTagName(g, thai)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right circular indicator column */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-white/5 pt-5 md:pt-0 pl-0 md:pl-6 flex flex-col justify-center items-center gap-4">
            <div className="relative flex items-center justify-center shrink-0">
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(148,163,184,0.15)"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-black font-mono leading-none tracking-tighter text-2xl text-slate-800 dark:text-white">
                  {match_percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="text-center shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-white/40 block">
                {thai ? "อัตราความเข้ากันได้" : "MATCH FIT"}
              </span>
              <span className="font-syne font-black text-3xl sm:text-4xl leading-none mt-1 block bg-linear-to-r from-[#F39200] to-orange-400 bg-clip-text text-transparent">
                {match_percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full gap-5">
          {/* Top row: Title and Circle side-by-side for Sidebar Cards */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="flex items-center gap-1.5 shrink-0">
                  {rank === 1 && (
                    <Star
                      size={16}
                      className="text-amber-400 shrink-0"
                      fill="currentColor"
                    />
                  )}
                  <span
                    className={cn(
                      'font-mono font-black leading-none tracking-tight text-2xl',
                      rankGradient(rank),
                    )}
                  >
                    {rank === 0 ? "-" : rank}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {track && TrackIcon && (
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: `${track.accent}1a`, color: track.accent }}
                    >
                      <TrackIcon className="size-2.5" strokeWidth={2.5} aria-hidden />
                      {thai ? track.labelTh : track.labelEn}
                    </span>
                  )}
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {career_group}
                  </span>
                  <span className={cn('text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider', programBadge(program))}>
                    {program}
                  </span>
                </div>
              </div>

              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-relaxed text-balance text-lg sm:text-xl">
                {career_name}
              </h3>
            </div>

            {/* Circular progress on the right */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(148,163,184,0.15)"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span
                  className="font-black font-mono leading-none tracking-tighter bg-linear-to-r bg-clip-text text-transparent text-sm"
                  style={{ backgroundImage: `linear-gradient(to right, ${strokeColor}, #FFB54D)` }}
                >
                  {match_percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar and Description */}
          <div>
            <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-3.5">
              <div 
                className="h-full rounded-full bg-linear-to-r"
                style={{
                  width: `${match_percentage}%`,
                  backgroundImage: rank === 2 
                    ? 'linear-gradient(to right, #2563EB, #60A5FA)'
                    : 'linear-gradient(to right, #8B5CF6, #A78BFA)',
                }}
              />
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-white/60 mb-4 font-medium font-thai">
              {desc}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {top_strengths.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="truncate max-w-[100px]">{cleanTagName(s, thai)}</span>
                </span>
              ))}
              {top_gaps.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span className="truncate max-w-[100px]">{cleanTagName(g, thai)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3-Column CSS Metrics Grid (Bottom Row) */}
      <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-white/5 grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div className="bg-slate-50 dark:bg-white/2 p-2.5 rounded-2xl border border-slate-200/40 dark:border-white/2 flex flex-col justify-center items-center">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40 flex items-center justify-center gap-1 leading-normal">
            <Target className="size-3 text-orange-500" />
            {thai ? "ช่องว่างทักษะ" : "Skills Gap"}
          </span>
          <span className="block mt-1 font-syne text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-none">
            {metrics.gap}
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-white/2 p-2.5 rounded-2xl border border-slate-200/40 dark:border-white/2 flex flex-col justify-center items-center">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40 flex items-center justify-center gap-1 leading-normal">
            <DollarSign className="size-3 text-slate-500 dark:text-white/50" />
            {thai ? "เงินเดือนแรกเข้า" : "Salary Range"}
          </span>
          <span className="block mt-1 font-syne text-[10px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-300 leading-none truncate max-w-full">
            {metrics.salary}
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-white/2 p-2.5 rounded-2xl border border-slate-200/40 dark:border-white/2 flex flex-col justify-center items-center">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40 flex items-center justify-center gap-1 leading-normal">
            <TrendingUp className="size-3 text-emerald-500" />
            {thai ? "เติบโต" : "Demand"}
          </span>
          <span className="block mt-1 font-syne text-xs sm:text-sm font-extrabold text-emerald-500 leading-none">
            {metrics.demand}
          </span>
        </div>
      </div>

      {/* Action Button CTA to analytics / close gap page */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex">
        {isHero ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#F39200] to-[#FFB54D] px-5 py-3.5 text-center text-sm font-black text-[#1a1100] shadow-lg shadow-[#F39200]/20 transition-all duration-300 group-hover:bg-position-[100%_0] hover:shadow-xl active:scale-[0.99]">
            <Search className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
            <span className={thai ? "leading-relaxed" : ""}>{thai ? "วิเคราะห์และวางแผนแผนการเรียน (Gap Analysis)" : "Skill Gap Analysis & Learning Plan"}</span>
            <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={2.5} aria-hidden />
          </div>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-xl border border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5">
            <span>{thai ? "ดูช่องว่างทักษะและหลักสูตรแนะนำ" : "View Skill Gaps & Courses"}</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
