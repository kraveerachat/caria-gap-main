"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseCard from "@/components/CourseCard";
import Loading from "@/components/ui/Loading";
import { CheckCircle2, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { MOCK_GAP_ANALYSIS } from "@/lib/mockData";
import type { GapAnalysisResponse, CourseRec } from "@/types";

interface CourseWithGap {
  course: CourseRec;
  gapScore: number;
  competencyId: string;
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user") || "demo_ton";
  const careerId = searchParams.get("career") || "C01";

  const [data, setData] = useState<GapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getGapAnalysis(userId, careerId);
        setData(res);
      } catch {
        setData(MOCK_GAP_ANALYSIS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, careerId]);

  if (loading || !data) {
    return <Loading mode="fullpage" />;
  }

  // Collect all courses from gaps, sorted by gap_score descending
  const coursesWithGap: CourseWithGap[] = [];
  const sortedGaps = [...data.gaps].sort((a, b) => b.gap_score - a.gap_score);

  for (const gap of sortedGaps) {
    for (const course of gap.recommended_courses) {
      coursesWithGap.push({
        course,
        gapScore: gap.gap_score,
        competencyId: gap.competency_id,
      });
    }
  }

  const totalGapAddressed = sortedGaps
    .filter((g) => g.recommended_courses.length > 0)
    .reduce((sum, g) => sum + g.gap_score, 0);

  const totalCourses = coursesWithGap.length;

  return (
    <div className="min-h-screen bg-background text-foreground font-thai relative overflow-hidden">
      <Navbar />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 right-1/4 h-[500px] w-[500px] rounded-full bg-brand-orange/15 blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[110px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 font-thai text-sm font-medium text-slate-500 transition-colors hover:text-brand-orange dark:text-slate-400"
        >
          <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden />
          กลับไปหน้า Gap Analysis
        </button>

        {/* Header */}
        <div className="mb-10 font-thai">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 font-syne text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange">
            <BookOpen className="size-3" strokeWidth={2.5} aria-hidden />
            Curriculum Match
          </div>
          <h1 className="font-syne text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl leading-tight text-balance">
            คอร์สเรียนเพื่อปิด Gap
          </h1>
          <p className="mt-3 text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            คอร์สแนะนำสำหรับอาชีพ{" "}
            <span className="font-bold text-brand-orange">
              {data.career.career_name}
            </span>
          </p>
        </div>

        {/* Summary Card */}
        <div className="mb-10 rounded-2xl border border-border bg-linear-to-br from-brand-orange/10 to-[#2563EB]/5 p-8 backdrop-blur-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                เรียนครบ{" "}
                <span className="text-brand-orange">{totalCourses} คอร์ส</span>{" "}
                ช่วยปิด Gap ได้{" "}
                <span className="text-emerald-500">{totalGapAddressed} จุด</span>
              </h2>
              <p className="mt-2 text-muted-foreground">
                คัดเลือกจากระบบ xLane SUT เพื่อปิด Gap ทักษะของคุณโดยตรง พร้อมสะสมหน่วยกิตล่วงหน้า
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-orange">
                  {totalCourses}
                </div>
                <div className="text-xs text-muted-foreground">คอร์ส</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500">
                  {totalGapAddressed}
                </div>
                <div className="text-xs text-muted-foreground">Gap points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {coursesWithGap.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesWithGap.map((item, idx) => (
              <div
                key={`${item.course.course_id}-${idx}`}
                className="transition-transform duration-300 hover:scale-[1.02]"
              >
                <CourseCard
                  course={item.course}
                  gapScore={item.gapScore}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state — competency profile complete for this career */
          <div className="mt-16 flex flex-col items-center text-center font-thai">
            <div className="flex size-20 items-center justify-center rounded-2xl border border-emerald-500/30 bg-white/70 text-emerald-500 backdrop-blur-xl dark:border-emerald-400/20 dark:bg-slate-900/60">
              <CheckCircle2 className="size-10" strokeWidth={2} aria-hidden />
            </div>
            <h3 className="mt-6 font-syne text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
              ไม่มี Gap ที่ต้องปิด
            </h3>
            <p className="mt-3 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              สมรรถนะของคุณครบถ้วนสำหรับอาชีพนี้แล้ว สามารถสำรวจอาชีพอื่นได้ทันที
            </p>
            <button
              onClick={() => router.push(`/dashboard?user=${userId}`)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-3 font-bold text-brand-orange-foreground shadow-[0_10px_30px_-8px_rgba(243,146,0,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              กลับไปดูอาชีพอื่น
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        )}

        {/* Back to career gap analysis */}
        {coursesWithGap.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() =>
                router.push(`/career/${careerId}?user=${userId}`)
              }
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-6 py-3 font-thai text-sm font-semibold text-slate-600 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-brand-orange/40 hover:text-brand-orange dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300"
            >
              <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden />
              กลับไป Gap Analysis
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<Loading mode="fullpage" />}>
      <MarketplaceContent />
    </Suspense>
  );
}
