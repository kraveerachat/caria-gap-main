"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/site-footer";
import CareerCard from "@/components/results/CareerCard";
import { CareerRoadmapTimeline } from "@/components/results/CareerRoadmapTimeline";
import Loading from "@/components/ui/Loading";
import { useLanguage } from "@/components/language-provider";
import { useMockUser } from "@/lib/mock-auth";
import Link from "next/link";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { CheckCircle2, Lock, ArrowRight, LineChart, Target, Trophy, SearchX } from "lucide-react";
import CurriculumTrackFunnel from "@/components/dashboard/CurriculumTrackFunnel";
import NextSteps from "@/components/dashboard/NextSteps";
import { getTrackForCareer } from "@/lib/sut-tracks";
import { DreamCareerMatch } from "@/components/dashboard/DreamCareerMatch";
import { useGapAnalysis } from "@/hooks/useGapAnalysis";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { CareerResult } from "@/types";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user") || "demo_ton";
  const { lang } = useLanguage();
  const thai = lang === "th";
  const user = useMockUser();
  const reduce = useReducedMotion();

  // Client-side ranking via the MES (Euclidean) engine — no backend.
  const { ready, hasData, careers, top4, dream, scores } = useGapAnalysis(userId);

  // No scores and no demo context: send the visitor to take the assessment.
  useEffect(() => {
    if (ready && !hasData) router.push("/assessment");
  }, [ready, hasData, router]);

  if (!ready || !hasData) {
    return <Loading mode="fullpage" />;
  }

  const handleCareerClick = (career: CareerResult) => {
    router.push(`/career/${career.career_id}?user=${userId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050A14] text-foreground font-thai relative overflow-hidden">
      <Navbar />

      {/* Ambient background — SUT Navy + Orange, kept subtle */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-orange/10 blur-[130px] dark:bg-brand-orange/15" />
        <div className="absolute bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-[#002F6C]/10 blur-[110px] dark:bg-[#002F6C]/25" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange">
              <Target className="size-3" strokeWidth={2.5} />
              {thai ? "ผลการประเมิน" : "Assessment Results"}
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl text-balance leading-tight">
              {thai ? "อาชีพที่เหมาะกับคุณ" : "Recommended Careers"}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {thai
                ? "ผลลัพธ์จากการวิเคราะห์สมรรถนะ 66 มิติ กับ 78 อาชีพดิจิทัล"
                : "Results of mapping 66 competency dimensions against 78 digital careers."}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              <span>User: <strong className="font-bold text-slate-900 dark:text-white">{userId}</strong></span>
            </div>
          </div>

          {/* Insights CTA */}
          <Link
            href={`/analytics?user=${userId}`}
            className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-brand-orange/30 bg-white/60 p-4 text-left shadow-sm backdrop-blur-md transition-all hover:scale-[1.02] hover:border-brand-orange/60 hover:shadow-lg hover:shadow-brand-orange/5 dark:bg-white/2 dark:border-white/10 dark:hover:border-brand-orange/40 md:w-80 shrink-0 select-none active:scale-[0.98]"
          >
            <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-brand-orange/10 blur-xl transition-all duration-300 group-hover:scale-150" />
            <div className="flex items-center gap-3.5 z-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange shadow-inner">
                <LineChart className="size-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.25} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-[13.5px] leading-tight font-thai">
                  {thai ? "สถิติเชิงลึก (Insights)" : "Deep Market Insights"}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-normal mt-0.5 max-w-[180px] font-thai">
                  {thai ? "สำรวจอุปสงค์อุปทาน และทักษะดิจิทัลที่ขาดแคลน" : "Explore skills shortage & market demand"}
                </p>
              </div>
            </div>
            <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 transition-colors group-hover:bg-brand-orange group-hover:text-white shrink-0 z-10">
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </div>
          </Link>
        </div>

        {/* Section 1: Dream Career Match */}
        {dream && (
          <DreamCareerMatch
            analysis={dream}
            userId={userId}
            onRoadmap={() => router.push(`/career/${dream.career.career_id}?user=${userId}`)}
          />
        )}

        {/* Section 2: Top 4 Recommended Careers */}
        <div className="mb-12">
          <div className="mb-8 text-center">
            <div className="mb-3 flex justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:border-amber-500/30 dark:text-amber-500">
                <Trophy className="size-3" strokeWidth={2.5} aria-hidden />
                <span>{thai ? "จัดอันดับด้วย Euclidean MES" : "Ranked by Euclidean MES"}</span>
              </div>
            </div>
            <h2 className="font-heading text-3xl font-black tracking-tight leading-normal text-slate-900 dark:text-white sm:text-4xl">
              {thai ? "อาชีพที่แนะนำ 4 อันดับแรก" : "Top 4 Recommended Careers"}
            </h2>
            <p className="mt-2.5 mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              {thai
                ? "คำนวณจากระยะห่างเชิงยุคลิด (Euclidean Distance) ระหว่างสมรรถนะ 66 มิติของคุณกับความต้องการของแต่ละอาชีพ"
                : "Computed from the Euclidean distance between your 66 competencies and each role's requirements."}
            </p>
          </div>

          {/* Rank 1 — hero */}
          {top4[0] && (
            <motion.div
              {...(reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } })}
              className="mb-6"
            >
              <CareerCard
                career={top4[0]}
                isTopRank
                isHero
                track={getTrackForCareer(top4[0])}
                onClick={() => handleCareerClick(top4[0])}
              />
            </motion.div>
          )}

          {/* Ranks 2–4 */}
          {top4.length > 1 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: reduce ? 0 : 0.12 } } }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {top4.slice(1, 4).map((career) => (
                <CareerCard
                  key={career.career_id}
                  career={career}
                  isTopRank
                  track={getTrackForCareer(career)}
                  onClick={() => handleCareerClick(career)}
                  className="h-full"
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* SUT Curriculum Track funnel — drill-down detail (B2B).
            Wrapped so a chart render failure degrades gracefully, never blank. */}
        {top4.length > 0 && (
          <ErrorBoundary>
            <CurriculumTrackFunnel careers={top4} userId={userId} scores={scores} />
          </ErrorBoundary>
        )}

        {/* Next Steps — download CARIA report + Fast-Track application (B2B lead-gen) */}
        {top4.length > 0 && <NextSteps careers={top4} userId={userId} />}

        {/* Login hook — guest → save & unlock */}
        {careers.length > 0 && (
          <div className="mt-8">
            {user ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                <p className="text-sm text-foreground">
                  {thai
                    ? `บันทึกผลลัพธ์ไว้ในบัญชีของ ${user.name} เรียบร้อยแล้ว`
                    : `Results saved to ${user.name}'s account`}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-brand-orange/30 bg-linear-to-br from-brand-orange/10 to-[#2563EB]/5 p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-[11px] font-bold text-brand-orange">
                      <Lock className="size-3" />
                      {thai ? "ปลดล็อกขั้นต่อไป" : "Unlock next step"}
                    </div>
                    <h3 className="text-xl font-bold text-foreground md:text-2xl">
                      {thai
                        ? "เข้าสู่ระบบเพื่อดูวิชาเรียนที่แนะนำและบันทึกผลลัพธ์ของคุณ"
                        : "Log in to see recommended courses & save your results"}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                      {thai
                        ? "ผลการประเมินถูกเก็บไว้ชั่วคราวบนเครื่องนี้ — เข้าสู่ระบบด้วย Google หรือ Facebook เพื่อบันทึกถาวรและปลดล็อกแผนการเรียนรายวิชา มทส."
                        : "Your results are stored locally for now — log in with Google or Facebook to save them and unlock the SUT course roadmap."}
                    </p>
                  </div>
                  <div className="w-full shrink-0 md:w-72">
                    <AuthButtons />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Personalized Career Roadmap Timeline */}
        {careers.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <CareerRoadmapTimeline />
          </div>
        )}

        {/* Empty State */}
        {careers.length === 0 && (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-slate-400 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-500">
              <SearchX className="size-7" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-5 text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {thai ? "ไม่พบข้อมูลอาชีพ" : "No career matches found"}
            </p>
            <button
              onClick={() => router.push("/assessment")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-brand-orange-foreground shadow-[0_10px_30px_-8px_rgba(243,146,0,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              {thai ? "กลับไปประเมินใหม่" : "Retake Assessment"}
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading mode="fullpage" />}>
      <DashboardContent />
    </Suspense>
  );
}
