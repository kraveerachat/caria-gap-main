'use client';

import { useMemo } from 'react';
import type { GapItem } from '@/types';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, GraduationCap, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { SUT_COURSES, SutCourse } from '@/lib/sut-courses';
import { Switch } from '@/components/ui/switch';

interface WhatIfSliderProps {
  gaps: GapItem[];
  closedGaps: Set<string>;
  onToggleGap: (competencyId: string) => void;
  className?: string;
}

const COMP_TO_SUT_COURSE: Record<string, string> = {
  'S16_Negotiation': 'DGT20 0700',
  'S19_Persuasion': 'DGT20 0800',
  'K26_Sales_and_Marketing': 'DGT20 1200',
  'K07_Design': '1101070',
  'A03_Enterprising': 'วิชาโท',
};

function normalize(str: string): string {
  return str
    .replace(/^[A-Z]\d{2}_/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, '')
    .replace(/&/g, 'and')
    .toLowerCase();
}

function cleanName(id: string): string {
  return id.replace(/^[A-Z]\d{2}_/, '').replace(/_/g, ' ');
}

function getSutCourseForCompetency(competencyId: string): SutCourse | null {
  const mappedId = COMP_TO_SUT_COURSE[competencyId];
  if (mappedId) {
    const course = SUT_COURSES.find(c => c.course_id === mappedId);
    if (course) return course;
  }
  const clean = cleanName(competencyId).toLowerCase();
  return SUT_COURSES.find(c =>
    c.competency_tags.some(t => normalize(t) === normalize(competencyId)) ||
    c.name_en.toLowerCase().includes(clean) ||
    c.name_th.includes(clean)
  ) || null;
}

export default function WhatIfSlider({
  gaps,
  closedGaps,
  onToggleGap,
  className,
}: WhatIfSliderProps) {
  const { lang } = useLanguage();
  const thai = lang === 'th';

  // Sort by gap score descending and take top 3
  const topGaps = useMemo(() => {
    return [...gaps]
      .sort((a, b) => b.gap_score - a.gap_score)
      .slice(0, 3);
  }, [gaps]);

  return (
    <div
      className={cn(
        'bg-card/50 dark:bg-card/30 backdrop-blur-md border border-border/60 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-brand-orange/10 border border-brand-orange/20">
          <SlidersHorizontal size={20} className="text-brand-orange" />
        </div>
        <div>
          <h3 className={`text-lg font-bold text-foreground ${thai ? "font-thai leading-relaxed" : ""}`}>
            {thai ? "แผนปิดช่องว่างทักษะ (Your Upskilling Path)" : "Your Upskilling Path"}
          </h3>
          <p className={`text-xs text-muted-foreground ${thai ? "font-thai leading-relaxed" : ""}`}>
            {thai ? "จำลองการเรียนวิชาแนะนำ มทส. เพื่อประเมินผลลัพธ์แบบ Real-time" : "Simulate SUT course completions to view real-time adjustments"}
          </p>
        </div>
      </div>

      {/* Actionable List */}
      <div className="space-y-4 flex-1">
        {topGaps.map((gap) => {
          const isClosed = closedGaps.has(gap.competency_id);
          const course = getSutCourseForCompetency(gap.competency_id);

          return (
            <div
              key={gap.competency_id}
              className={cn(
                'p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 select-none',
                isClosed
                  ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/20'
                  : 'bg-muted/40 dark:bg-white/1 border-border/50 dark:border-white/5 hover:border-brand-orange/30'
              )}
            >
              <div className="flex items-center justify-between">
                {/* Skill info */}
                <div className="flex flex-col gap-0.5">
                  <span className={cn(
                    'text-sm font-semibold text-foreground tracking-wide transition-all',
                    isClosed && 'text-emerald-500 dark:text-emerald-400 font-bold'
                  )}>
                    {cleanName(gap.competency_id)}
                  </span>
                  <span className="text-[10px] text-red-500 dark:text-red-400/90 font-medium">
                    {thai ? `(ขาด ${gap.gap_score} จุด)` : `(gap: ${gap.gap_score} pts)`}
                  </span>
                </div>

                {/* Switch Toggle */}
                <div className="flex items-center gap-2">
                  {isClosed && (
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                      <CheckCircle size={12} />
                      {thai ? 'เรียนเสร็จแล้ว' : 'Completed'}
                    </span>
                  )}
                  <Switch
                    checked={isClosed}
                    onCheckedChange={() => onToggleGap(gap.competency_id)}
                  />
                </div>
              </div>

              {/* Course advisory details block */}
              {course && (
                <div className="pt-2.5 border-t border-border/40 dark:border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold font-mono">
                    <GraduationCap size={12} className="text-brand-orange" />
                    <span>CODE: {course.course_id}</span>
                    <span>•</span>
                    <span>{course.credits} {thai ? "หน่วยกิต" : "Credits"}</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground/90 font-thai">
                    {thai ? course.name_th : course.name_en}
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-thai font-medium line-clamp-2">
                    {course.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
