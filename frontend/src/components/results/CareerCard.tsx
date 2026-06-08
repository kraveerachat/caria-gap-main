'use client';

import type { CareerResult } from '@/types';
import type { SutTrack } from '@/lib/sut-tracks';
import { cn } from '@/lib/utils';
import { ChevronRight, Star, Sparkles, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useLanguage } from '@/components/language-provider';
import { motion, useReducedMotion } from 'framer-motion';

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
/*  Per-career role summaries.                                          */
/*  The recommendation payload carries no description field, so a short */
/*  role summary is resolved from the career id, then the career group. */
/* ------------------------------------------------------------------ */

const CAREER_DESCRIPTIONS: Record<string, { th: string; en: string }> = {
  DT08: {
    th: 'พัฒนาเว็บแอปและระบบซอฟต์แวร์เพื่อแก้โจทย์ธุรกิจและกระบวนการทำงานดิจิทัล',
    en: 'Builds web apps and software systems that solve business problems and digital workflows.',
  },
  DT18: {
    th: 'สร้างโมเดล Machine Learning เพื่อสกัดข้อมูลเชิงลึกและขับเคลื่อนการตัดสินใจด้วยข้อมูล',
    en: 'Builds machine-learning models that surface insight and drive data-led decisions.',
  },
  DT26: {
    th: 'ออกแบบสถาปัตยกรรมคลาวด์ที่ยืดหยุ่นและปลอดภัย ดูแลเครือข่ายและโครงสร้างพื้นฐานดิจิทัล',
    en: 'Designs flexible, secure cloud architecture and the networks behind it.',
  },
  DT31: {
    th: 'เฝ้าระวัง ตรวจจับ และตอบสนองภัยคุกคามไซเบอร์ พร้อมวางกลยุทธ์การป้องกัน',
    en: 'Detects and responds to cyber threats and sets the defense strategy.',
  },
  DT17: {
    th: 'ออกแบบ Data Pipeline เพื่อจัดเก็บและประมวลผลข้อมูลขนาดใหญ่สำหรับงานวิเคราะห์',
    en: 'Builds data pipelines that store and process big data for analytics.',
  },
  DT04: {
    th: 'พัฒนาเว็บแอปที่รองรับทุกหน้าจอ ด้วยความปลอดภัยและประสิทธิภาพสูง',
    en: 'Builds responsive web apps with strong security and performance.',
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function programBadge(program: string): string {
  if (program === 'DT') {
    return 'bg-[#F39200]/10 text-[#b86c00] dark:text-[#F39200] dark:bg-[#F39200]/15 border border-[#F39200]/25';
  }
  return 'bg-[#002F6C]/10 text-[#002F6C] dark:text-[#6aa6e8] dark:bg-[#1e90ff]/15 border border-[#002F6C]/20 dark:border-[#1e90ff]/25';
}

/** Solid rank color (gradient-clipped text is banned in the design system). */
function rankColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'text-amber-500';
    case 2:
      return 'text-slate-400 dark:text-slate-300';
    case 3:
      return 'text-amber-700 dark:text-amber-600';
    default:
      return 'text-slate-400 dark:text-white/40';
  }
}

function matchColor(pct: number): string {
  if (pct >= 85) return '#10B981'; // Emerald
  if (pct >= 70) return '#F39200'; // SUT Orange
  return '#FFB54D';
}

/** Turn a competency id (e.g. `S12_Group_Complex_Problem_Solving`) into a label. */
function cleanTagName(tag: string, isThai: boolean): string {
  const clean = tag.replace(/^[SKA]\d+_(Group_)?/, '').replace(/_/g, ' ');

  const thMap: Record<string, string> = {
    Programming: 'เขียนโปรแกรม',
    'Complex Problem Solving': 'แก้ปัญหาซับซ้อน',
    'Technology Design': 'ออกแบบเทคโนโลยี',
    Negotiation: 'การเจรจาต่อรอง',
    'Sales and Marketing': 'การขายและการตลาด',
    Persuasion: 'การโน้มน้าวใจ',
    Design: 'การออกแบบ',
    Mathematics: 'คณิตศาสตร์',
    'Systems Analysis': 'วิเคราะห์ระบบ',
    Artistic: 'ศิลปะและความสร้างสรรค์',
    'Fine Arts': 'วิจิตรศิลป์',
    'Critical Thinking': 'การคิดเชิงวิพากษ์',
    Troubleshooting: 'การแก้ปัญหาเทคนิค',
    'Quality Control Analysis': 'ควบคุมตรวจสอบคุณภาพ',
    'Systems Design': 'ออกแบบระบบ',
    'Management of Financial Resources': 'การบริหารเงินทุน',
    'Economics and Accounting': 'เศรษฐศาสตร์และบัญชี',
    'Communications and Media': 'สื่อและการสื่อสาร',
    Psychology: 'จิตวิทยา',
    'Administration and Management': 'การบริหารการจัดการ',
  };

  if (isThai && thMap[clean]) return thMap[clean];
  return clean;
}

/* ------------------------------------------------------------------ */
/*  Match-fit ring                                                     */
/* ------------------------------------------------------------------ */

function MatchRing({
  pct,
  size,
  stroke,
  reduce,
  big = false,
}: {
  pct: number;
  size: number;
  stroke: number;
  reduce: boolean | null;
  big?: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = matchColor(pct);

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: reduce ? 'none' : 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <span
        className={cn(
          'absolute font-mono font-black leading-none tracking-tight text-slate-900 dark:text-white',
          big ? 'text-2xl' : 'text-sm',
        )}
      >
        {pct.toFixed(0)}
        <span className={cn('font-bold', big ? 'text-base' : 'text-[10px]')}>%</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CareerCard({ career, isTopRank, isHero, track, onClick, className }: CareerCardProps) {
  const { lang } = useLanguage();
  const thai = lang === 'th';
  const reduce = useReducedMotion();
  const TrackIcon = track?.Icon;
  const { rank, career_id, career_name, career_group, program, match_percentage, top_strengths } = career;

  // Short role summary resolved from id, then group.
  const desc = useMemo(() => {
    const name = career_name.toLowerCase();
    const matchId =
      career_id === 'DT18' || name.includes('data scientist') ? 'DT18'
      : career_id === 'DT26' || name.includes('cloud architect') ? 'DT26'
      : career_id === 'DT31' || name.includes('security') || name.includes('cyber') ? 'DT31'
      : career_id === 'DT08' || name.includes('software developer') ? 'DT08'
      : career_id === 'DT17' || name.includes('data engineer') ? 'DT17'
      : career_id === 'DT04' || name.includes('web developer') ? 'DT04'
      : '';

    const mapped = CAREER_DESCRIPTIONS[matchId];
    if (mapped) return thai ? mapped.th : mapped.en;

    const group = career_group.toLowerCase();
    if (group.includes('software') || group.includes('web')) {
      return thai
        ? 'ออกแบบและวิเคราะห์ระบบซอฟต์แวร์ วางโครงสร้างแอปเพื่อแก้โจทย์วิศวกรรมและธุรกิจดิจิทัล'
        : 'Designs and analyzes software systems and app architecture for engineering and digital business.';
    }
    if (group.includes('data') || group.includes('ai')) {
      return thai
        ? 'ออกแบบและจัดการข้อมูล วาง Pipeline ประมวลผลข้อมูลขนาดใหญ่ และวิเคราะห์เชิงสถิติ'
        : 'Designs and manages data, builds big-data pipelines, and runs statistical analysis.';
    }
    return thai
      ? `ออกแบบและบริหารโซลูชันในสาย ${career_group} ด้วยเทคโนโลยีและความเชี่ยวชาญเฉพาะทาง`
      : `Designs and manages ${career_group} solutions with specialist technical expertise.`;
  }, [career_id, career_name, career_group, thai]);

  const strengths = top_strengths.slice(0, isHero ? 3 : 2);

  const ringSize = isHero ? 92 : isTopRank ? 64 : 58;
  const ringStroke = isHero ? 7 : 5;

  const cardVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        },
      };

  /* ---- shared sub-blocks ---- */

  const Chips = (
    <div className="flex flex-wrap items-center gap-1.5">
      {track && TrackIcon && (
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: `${track.accent}1a`, color: track.accent }}
        >
          <TrackIcon className="size-2.5" strokeWidth={2.5} aria-hidden />
          {thai ? track.labelTh : track.labelEn}
        </span>
      )}
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {career_group}
      </span>
      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', programBadge(program))}>{program}</span>
    </div>
  );

  const Strengths = strengths.length > 0 && (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        <Sparkles className="size-3" strokeWidth={2.5} aria-hidden />
        {thai ? 'จุดแข็ง' : 'Strengths'}
      </span>
      {strengths.map((s) => (
        <span
          key={s}
          className="rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
        >
          {cleanTagName(s, thai)}
        </span>
      ))}
    </div>
  );

  return (
    <motion.div
      variants={cardVariants}
      whileHover={reduce ? undefined : { y: -5 }}
      onClick={onClick}
      className={cn(
        'group relative flex cursor-pointer flex-col rounded-3xl border bg-white/85 backdrop-blur-xl transition-shadow duration-300 dark:bg-slate-900/60',
        isHero
          ? 'p-7 lg:col-span-2 border-[#F39200]/30 shadow-[0_0_50px_rgba(243,146,0,0.1)]'
          : 'p-5 border-slate-200/80 shadow-lg hover:shadow-xl dark:border-white/10',
        className,
      )}
    >
      {isHero && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#F39200]/12 blur-3xl"
        />
      )}

      {/* TOP MATCH ribbon */}
      {isHero && rank === 1 && (
        <div className="absolute -top-3 left-7 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 font-heading text-[10px] font-black uppercase tracking-wider text-[#1a1100] shadow-md shadow-brand-orange/25">
            <Star className="size-3" fill="currentColor" />
            <span>TOP MATCH</span>
          </div>
        </div>
      )}

      {/* ---- Body ---- */}
      {isHero ? (
        <div className="flex flex-1 flex-col gap-5 md:flex-row md:items-start md:gap-7">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className={cn('font-mono text-3xl font-black leading-none tracking-tight', rankColor(rank))}>
                {rank === 0 ? '★' : rank}
              </span>
              {Chips}
            </div>
            <h3 className="text-balance font-extrabold tracking-tight text-slate-900 dark:text-white text-2xl sm:text-3xl leading-tight">
              {career_name}
            </h3>
            <p className="font-thai text-sm font-medium leading-relaxed text-slate-600 line-clamp-2 dark:text-slate-300">
              {desc}
            </p>
            {Strengths}
          </div>

          {/* Match ring */}
          <div className="flex shrink-0 flex-col items-center gap-2 border-t border-slate-200/60 pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0 dark:border-white/10">
            <MatchRing pct={match_percentage} size={ringSize} stroke={ringStroke} reduce={reduce} big />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50">
              {thai ? 'ความเข้ากันได้' : 'Match fit'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="flex shrink-0 items-center gap-1">
                  {rank === 1 && <Star size={15} className="text-amber-400" fill="currentColor" aria-hidden />}
                  <span className={cn('font-mono text-2xl font-black leading-none tracking-tight', rankColor(rank))}>
                    {rank === 0 ? '★' : rank}
                  </span>
                </span>
                {Chips}
              </div>
              <h3 className="text-balance font-extrabold tracking-tight text-slate-900 dark:text-white text-lg sm:text-xl leading-snug">
                {career_name}
              </h3>
            </div>
            <MatchRing pct={match_percentage} size={ringSize} stroke={ringStroke} reduce={reduce} />
          </div>

          <p className="font-thai text-xs font-medium leading-relaxed text-slate-600 line-clamp-2 dark:text-slate-300">
            {desc}
          </p>

          {Strengths}
        </div>
      )}

      {/* ---- CTA ---- */}
      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/5">
        {isHero ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange px-5 py-3.5 text-sm font-bold text-brand-orange-foreground shadow-md shadow-brand-orange/20 transition-transform duration-300 group-hover:scale-[1.01] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <Search className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
            <span className={thai ? 'leading-relaxed' : ''}>
              {thai ? 'วิเคราะห์ช่องว่างทักษะและวางแผนการเรียน' : 'Skill gap analysis & learning plan'}
            </span>
            <ChevronRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              strokeWidth={2.5}
              aria-hidden
            />
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-orange/30 px-4 py-2.5 text-center text-xs font-bold text-brand-orange transition-colors hover:bg-brand-orange/5">
            <span>{thai ? 'ดูช่องว่างทักษะและหลักสูตรแนะนำ' : 'View skill gaps & courses'}</span>
            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              aria-hidden
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
