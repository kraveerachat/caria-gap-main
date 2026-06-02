"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GapRadarChart, { PriorityGapsList } from "@/components/dashboard/GapAnalysisSection";
import WhatIfSlider from "@/components/WhatIfSlider";
import { GapBarChart } from "@/components/gap/GapBarChart";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/Loading";
import { api } from "@/lib/api";
import { MOCK_GAP_ANALYSIS } from "@/lib/mockData";
import type { GapAnalysisResponse, CompetencyScores } from "@/types";
import { useLanguage } from "@/components/language-provider";
import { CourseMatcher } from "@/components/results/CourseMatcher";
import { SlidersHorizontal, AlertTriangle, BarChart3, GraduationCap, Dumbbell, Radar as RadarIcon } from "lucide-react";

export default function CareerGapPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const thai = lang === "th";
  const params = useParams();
  const searchParams = useSearchParams();

  const careerId = params.id as string;
  const userId = searchParams.get("user") || "demo_ton";

  const [data, setData] = useState<GapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedMatch, setAnimatedMatch] = useState(0);
  const [closedGaps, setClosedGaps] = useState<Set<string>>(new Set());
  const [simulatedMatchPct, setSimulatedMatchPct] = useState(0);

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

  useEffect(() => {
    if (data) {
      setSimulatedMatchPct(data.match_percentage);
    }
  }, [data]);

  // Handle toggle gap
  const toggleGap = (competencyId: string) => {
    setClosedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(competencyId)) {
        next.delete(competencyId);
      } else {
        next.add(competencyId);
      }
      return next;
    });
  };

  // Helper to normalize strings for matching labels
  const normalize = (str: string) => {
    return str
      .replace(/^[A-Z]\d{2}_/, '')
      .replace(/_/g, ' ')
      .replace(/\s+/g, '')
      .replace(/&/g, 'and')
      .toLowerCase();
  };

  // Derived simulated radar_data
  const simulatedRadarData = useMemo(() => {
    if (!data) return null;
    const cloned = JSON.parse(JSON.stringify(data.radar_data));

    closedGaps.forEach((competencyId) => {
      const gapItem = data.gaps.find((g) => g.competency_id === competencyId);
      if (!gapItem) return;

      const domain = gapItem.domain.toLowerCase();
      const key =
        domain === "skill"
          ? "drilldown_skills"
          : domain === "attitude"
          ? "drilldown_attitudes"
          : "drilldown_knowledge";
      const targetRadar = cloned[key];
      if (!targetRadar) return;

      const index = targetRadar.labels.findIndex((label: string) => {
        return normalize(competencyId) === normalize(label);
      });

      if (index !== -1) {
        // Closed means student score rises to match the required career score
        targetRadar.student_scores[index] = targetRadar.career_scores[index];
      }
    });

    // Update averages for 3-axis radar chart
    if (cloned.drilldown_skills) {
      cloned.summary_3axis.student_averages[0] =
        Math.round(
          (cloned.drilldown_skills.student_scores.reduce((a: number, b: number) => a + b, 0) /
            cloned.drilldown_skills.student_scores.length) *
            10
        ) / 10;
    }
    if (cloned.drilldown_attitudes) {
      cloned.summary_3axis.student_averages[1] =
        Math.round(
          (cloned.drilldown_attitudes.student_scores.reduce((a: number, b: number) => a + b, 0) /
            cloned.drilldown_attitudes.student_scores.length) *
            10
        ) / 10;
    }
    if (cloned.drilldown_knowledge) {
      cloned.summary_3axis.student_averages[2] =
        Math.round(
          (cloned.drilldown_knowledge.student_scores.reduce((a: number, b: number) => a + b, 0) /
            cloned.drilldown_knowledge.student_scores.length) *
            10
        ) / 10;
    }

    return cloned;
  }, [data, closedGaps]);

  // Derived simulated Match Fit %
  useEffect(() => {
    if (!data) return;
    if (data.gaps.length === 0) {
      setSimulatedMatchPct(data.match_percentage);
      return;
    }

    const topGaps = [...data.gaps]
      .sort((a, b) => b.gap_score - a.gap_score)
      .slice(0, 3);

    const totalGapScore = topGaps.reduce((acc, curr) => acc + curr.gap_score, 0);
    if (totalGapScore === 0) {
      setSimulatedMatchPct(data.match_percentage);
      return;
    }

    const closedGapScore = topGaps
      .filter((g) => closedGaps.has(g.competency_id))
      .reduce((acc, curr) => acc + curr.gap_score, 0);

    const currentPct = data.match_percentage;
    const remainingRange = 100 - currentPct;
    const simulatedIncrease = remainingRange * (closedGapScore / totalGapScore);
    const finalPct = Math.min(100, Math.round((currentPct + simulatedIncrease) * 10) / 10);
    setSimulatedMatchPct(finalPct);
  }, [data, closedGaps]);

  // Animated counter for match percentage
  useEffect(() => {
    if (simulatedMatchPct === 0) return;
    const target = simulatedMatchPct;
    let current = animatedMatch;
    
    // Determine step size
    const diff = target - current;
    if (Math.abs(diff) < 0.1) {
      setAnimatedMatch(target);
      return;
    }
    
    const step = diff / 15; // 15 frames transition
    let count = 0;
    
    const timer = setInterval(() => {
      current += step;
      count++;
      if (count >= 15 || Math.abs(current - target) < 0.15) {
        setAnimatedMatch(target);
        clearInterval(timer);
      } else {
        setAnimatedMatch(Math.round(current * 10) / 10);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [simulatedMatchPct]);

  if (loading || !data) {
    return <Loading mode="fullpage" />;
  }

  // Build currentScores from gap + strength items
  const currentScores: CompetencyScores = {};
  data.gaps.forEach((g) => {
    currentScores[g.competency_id] = g.student_score;
  });
  data.strengths.forEach((s) => {
    currentScores[s.competency_id] = s.student_score;
  });

  const readiness = data.readiness_percentage;

  return (
    <div className="min-h-screen bg-background text-foreground font-thai relative overflow-hidden">
      <Navbar />

      {/* Ambient background glows tailored to SUT brand palette */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-0 h-[500px] w-[500px] rounded-full bg-brand-orange/10 dark:bg-brand-orange/15 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[80px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20">
        {/* Header Card */}
        <div className="mb-10 rounded-2xl border border-border/60 dark:border-white/5 bg-card/50 dark:bg-card/30 p-8 backdrop-blur-md shadow-sm">
          {/* Back button inside grid */}
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground pointer-events-auto"
          >
            ← {thai ? "กลับไปหน้าผลลัพธ์" : "Back to Results"}
          </button>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold md:text-4xl">
                <span className="bg-linear-to-r from-brand-orange to-orange-400 bg-clip-text text-transparent">
                  {data.career.career_name}
                </span>
              </h1>
              <p className="mt-2 text-muted-foreground text-sm font-medium">
                Gap Analysis — {thai ? "การวิเคราะห์ช่องว่างสมรรถนะ" : "Competency Gap Analysis"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              {/* Animated match % */}
              <div className="text-center sm:text-left">
                <div className="text-5xl font-extrabold text-brand-orange">
                  {animatedMatch.toFixed(1)}
                  <span className="text-2xl font-bold">%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-semibold">{thai ? "ความเหมาะสม (Match Fit)" : "Match Fit"}</div>
              </div>

              {/* Readiness bar */}
              <div className="w-full sm:w-48">
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">{thai ? "ความพร้อมหลักสูตร" : "Curriculum Readiness"}</span>
                  <span className="text-emerald-500 font-bold">{readiness}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted-foreground/15">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                    style={{ width: `${readiness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Radar Chart + What-If Simulator */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left - Radar Chart (col-span-3) */}
          <div className="lg:col-span-3 flex flex-col justify-stretch">
            <div className="flex-1">
              <h2 className="mb-4 flex items-center gap-2.5 font-syne text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
                <RadarIcon className="size-5 text-[#002F6C] dark:text-[#6AA6E8]" strokeWidth={2.25} aria-hidden />
                {thai ? "แผนภูมิใยแมงมุมสมรรถนะ" : "Drilldown Radar"}
              </h2>
              <GapRadarChart radarData={simulatedRadarData || data.radar_data} />
              <p className="mt-3 text-xs text-muted-foreground text-center font-medium font-thai">
                {thai 
                  ? "* พื้นที่สีส้มคือทักษะปัจจุบันของคุณ พื้นที่สีน้ำเงินคือเป้าหมายของอาชีพ" 
                  : "* The orange area represents your current profile, while the blue area represents the career target."
                }
              </p>
            </div>
          </div>

          {/* Right - What-If Simulator (col-span-2) */}
          <div className="lg:col-span-2 flex flex-col justify-stretch">
            <div className="flex-1">
              <h2 className="mb-4 flex items-center gap-2.5 font-syne text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
                <SlidersHorizontal className="size-5 text-brand-orange" strokeWidth={2.25} aria-hidden />
                {thai ? "แผนปิดช่องว่างทักษะ" : "Your Upskilling Path"}
              </h2>
              <WhatIfSlider
                gaps={data.gaps}
                closedGaps={closedGaps}
                onToggleGap={toggleGap}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Priority Gaps List + Gap Bar Chart */}
        <div className="grid gap-8 lg:grid-cols-5 mt-10">
          {/* Left - Priority Gaps (col-span-3) */}
          <div className="lg:col-span-3 flex flex-col justify-stretch">
            <div className="flex-1">
              <h2 className="mb-4 flex items-center gap-2.5 font-syne text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
                <AlertTriangle className="size-5 text-amber-500" strokeWidth={2.25} aria-hidden />
                {thai ? "ช่องว่างสมรรถนะสำคัญ" : "Priority Gaps"}
              </h2>
              <PriorityGapsList gaps={data.gaps} />
            </div>
          </div>

          {/* Right - Gap Bar Chart (col-span-2) */}
          <div className="lg:col-span-2 flex flex-col justify-stretch">
            <div className="flex-1">
              <h2 className="mb-4 flex items-center gap-2.5 font-syne text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
                <BarChart3 className="size-5 text-[#002F6C] dark:text-[#6AA6E8]" strokeWidth={2.25} aria-hidden />
                {thai ? "แผนภูมิเปรียบเทียบช่องว่าง" : "Top Gaps Comparison"}
              </h2>
              <GapBarChart
                gaps={data.gaps}
                maxItems={10}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* SUT Course Curriculum Mapping & Career Group Matcher */}
        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2.5 font-syne text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
            <GraduationCap className="size-5 text-brand-orange" strokeWidth={2.25} aria-hidden />
            {thai ? "การวิเคราะห์และแนะนำแผนการเรียน มทส." : "SUT Curriculum Advisory"}
          </h2>
          <CourseMatcher
            careerName={data.career.career_name}
            gaps={data.gaps}
            lang={lang}
          />
        </div>

        {/* Strengths */}
        {data.strengths.length > 0 && (
          <div className="mt-10 rounded-2xl border border-border/60 bg-card/50 dark:bg-card/30 p-6 backdrop-blur-md shadow-sm">
            <h2 className="mb-4 flex items-center gap-2.5 font-syne text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
              <Dumbbell className="size-5 text-emerald-500" strokeWidth={2.25} aria-hidden />
              {thai ? "จุดแข็งของคุณ (Your Strengths)" : "Your Strengths"}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {data.strengths.map((s) => (
                <Badge
                  key={s.competency_id}
                  variant="default"
                  className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 text-sm font-semibold rounded-xl"
                >
                  {s.competency_id.replace(/_/g, " ")} — {s.student_score}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push(`/dashboard?user=${userId}`)}
            className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-350 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 bg-white/5 dark:bg-white/2 px-8 py-4 text-lg font-bold text-slate-700 dark:text-slate-200 transition-all duration-300 hover:scale-105"
          >
            ← {thai ? "กลับไปหน้าผลลัพธ์อาชีพ" : "Back to Career Results"}
          </button>
          
          <Link
            href={`/marketplace?user=${userId}&career=${careerId}`}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-brand-orange px-8 py-4 text-lg font-bold text-brand-orange-foreground shadow-lg shadow-brand-orange/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-orange/30"
          >
            {thai ? "ค้นหาคอร์สเรียนเพื่อเรียนล่วงหน้าและปิด Gap" : "Find Courses to Close Gaps"}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
