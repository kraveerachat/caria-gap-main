'use client';

import type { CourseRec } from '@/types';
import { cn } from '@/lib/utils';
import { ExternalLink, Clock, GraduationCap } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CourseCardProps {
  course: CourseRec;
  gapScore?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function providerStyle(provider: string): string {
  if (provider.toLowerCase().includes('xlane')) {
    return 'bg-[#F39200]/10 text-[#F39200] border-[#F39200]/20';
  }
  switch (provider.toLowerCase()) {
    case 'coursera':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'skooldio':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

function gapFillColor(gap: number): string {
  if (gap > 30) return 'bg-red-500';
  if (gap >= 15) return 'bg-amber-500';
  return 'bg-emerald-500';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CourseCard({ course, gapScore, className }: CourseCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#0a0f1c]/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden',
        'hover:-translate-y-1 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]',
        'transition-all duration-300 group flex flex-col',
        className,
      )}
    >
      {/* Course Thumbnail */}
      <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={course.thumbnail_url} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100%" height="100%" fill="%23f1f5f9"/></svg>';
            }}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900" />
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Top row — provider + affiliate */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              'text-[10px] font-semibold px-2.5 py-0.5 rounded-full border',
              providerStyle(course.provider),
            )}
          >
            {course.provider}
          </span>
          {course.affiliate && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F39200]/10 text-[#F39200] border border-[#F39200]/20">
              Partner
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-orange transition-colors leading-snug mb-3">
          {course.title}
        </h4>

      {/* Info row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {course.duration_hours}h
        </span>
        <span className="flex items-center gap-1.5">
          <GraduationCap size={14} />
          {course.level ?? 'All Levels'}
        </span>
      </div>

      {/* Price */}
      <div className="mb-3">
        {course.price_thb === 0 ? (
          <span className="inline-flex items-center text-sm font-semibold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg">
            ฟรี
          </span>
        ) : (
          <span className="text-foreground font-semibold text-sm">
            ฿{course.price_thb.toLocaleString()}
          </span>
        )}
      </div>

      {/* Gap progress */}
      {gapScore !== undefined && gapScore > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Gap Addressed</span>
            <span className="font-mono">{gapScore.toFixed(1)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', gapFillColor(gapScore))}
              style={{ width: `${Math.min(gapScore, 100)}%` }}
            />
          </div>
        </div>
      )}

        {/* Spacer to push CTA down */}
        <div className="flex-1" />

        {/* CTA */}
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'w-full mt-5 flex items-center justify-center gap-2 font-semibold text-sm',
            'bg-slate-50 dark:bg-white/5 hover:bg-brand-orange hover:text-white text-slate-700 dark:text-slate-200',
            'border border-slate-200 dark:border-white/10 hover:border-brand-orange rounded-xl py-2.5 px-4',
            'transition-all duration-300',
          )}
        >
          Enroll Now
          <ExternalLink size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}
