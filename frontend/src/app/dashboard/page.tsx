"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CareerCard from "@/components/results/CareerCard";
import { CareerRoadmapTimeline } from "@/components/results/CareerRoadmapTimeline";
import Loading from "@/components/ui/Loading";
import { api } from "@/lib/api";
import { MOCK_TOP10 } from "@/lib/mockData";
import type { Top10Response, CareerResult } from "@/types";
import { useLanguage } from "@/components/language-provider";
import { useMockUser } from "@/lib/mock-auth";
import Link from "next/link";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { CheckCircle2, Lock, Sparkles, AlertCircle, ArrowRight, LineChart, Target, Trophy, Heart, SearchX, Rocket } from "lucide-react";
import { CAREER_THAI_NAMES } from "@/lib/career-translations";
import mockCareers from "@/lib/mock_careers.json";
import CurriculumTrackFunnel from "@/components/dashboard/CurriculumTrackFunnel";
import { getTrackForCareer } from "@/lib/sut-tracks";

// Module-level cache to persist data across React Strict Mode double-mount in development
// and prevent timing-based bugs when navigating to Dashboard.
let cachedData: any = null;
let hasLoadedData = false;

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user") || "demo_ton";
  const { lang, t } = useLanguage();
  const thai = lang === "th";
  const user = useMockUser();

  const [data, setData] = useState<Top10Response | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Try localStorage first (offline fallback)
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("caria_top10");
          if (cached) {
            const parsed = JSON.parse(cached);
            cachedData = parsed;
            hasLoadedData = true;
            setData(parsed);
            setLoading(false);
            localStorage.removeItem("caria_top10");
            return;
          }

          // If we already loaded data in this lifecycle, use it
          if (hasLoadedData) {
            if (cachedData) {
              setData(cachedData);
              setLoading(false);
              return;
            } else {
              router.push("/assessment");
              return;
            }
          }

          // Otherwise, redirect to assessment since we have no data
          hasLoadedData = true;
          router.push("/assessment");
          return;
        }
        const res = await api.getRecommendations(userId);
        setData(res);
      } catch {
        setData(MOCK_TOP10);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, router]);

  const [dreamCareerData, setDreamCareerData] = useState<CareerResult | null>(null);
  const [dreamCareerLoading, setDreamCareerLoading] = useState(false);

  useEffect(() => {
    if (loading || !data) return;

    // 1. Retrieve selected dream career ID
    let dreamId = "";
    let dreamName = "";
    if (typeof window !== "undefined") {
      const localDream = localStorage.getItem("user_dream_career") || localStorage.getItem("dreamCareer");
      if (localDream) {
        try {
          const parsed = JSON.parse(localDream);
          if (parsed && parsed.id) {
            dreamId = parsed.id;
            dreamName = parsed.name || "";
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (!dreamId) {
      dreamId = data.dream_career_id || (typeof window !== "undefined" ? localStorage.getItem("caria_dream_career_id") : "") || "";
      const found = (mockCareers as any[]).find(c => c.career_id === dreamId);
      dreamName = found ? found.career_name : "";
    }

    if (!dreamId) return;

    // 2. Check if it's already in the top 10 careers list
    const isInTop10 = (data.top10_careers || []).some(c => c.career_id === dreamId);
    if (isInTop10) {
      setDreamCareerData(null);
      return;
    }

    // 3. Load gap analysis for the dream career to construct the CareerResult
    async function loadDreamCareer() {
      setDreamCareerLoading(true);
      try {
        const gapRes = await api.getGapAnalysis(userId, dreamId);
        
        // Find career metadata
        const mockCareerInfo = (mockCareers as { career_id: string; career_name: string; career_group: string; program: string }[]).find(
          c => c.career_id === dreamId
        );
        
        const careerResult: CareerResult = {
          rank: 0, // indicates not in top 10
          career_id: dreamId,
          career_name: mockCareerInfo ? mockCareerInfo.career_name : dreamName,
          career_group: mockCareerInfo ? mockCareerInfo.career_group : "Digital",
          program: mockCareerInfo ? mockCareerInfo.program : "DT",
          match_percentage: gapRes.match_percentage,
          raw_mes: 0,
          top_strengths: (gapRes.strengths || []).slice(0, 2).map(s => s.competency_id),
          top_gaps: (gapRes.gaps || []).slice(0, 2).map(g => g.competency_id)
        };
        setDreamCareerData(careerResult);
      } catch (err) {
        console.error("Failed to load dream career gap analysis:", err);
      } finally {
        setDreamCareerLoading(false);
      }
    }

    loadDreamCareer();
  }, [loading, data, userId]);

  const handleCareerClick = (career: CareerResult) => {
    router.push(`/career/${career.career_id}?user=${userId}`);
  };

  if (loading) {
    return <Loading mode="fullpage" />;
  }

  const careers = data?.top10_careers || [];
  const top3 = careers.slice(0, 3);
  const rest = careers.slice(3);

  // Retrieve selected dream career
  let selectedDreamCareer: { id: string; name: string } | null = null;
  if (typeof window !== "undefined") {
    const localDream = localStorage.getItem("user_dream_career") || localStorage.getItem("dreamCareer");
    if (localDream) {
      try {
        const parsed = JSON.parse(localDream);
        if (parsed && parsed.id) {
          selectedDreamCareer = {
            id: parsed.id,
            name: parsed.name || ""
          };
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Fallback to legacy flat keys if selectedDreamCareer is still null
  if (!selectedDreamCareer) {
    const dreamCareerId = data?.dream_career_id || (typeof window !== "undefined" ? localStorage.getItem("caria_dream_career_id") : "") || "";
    const dreamCareerObj = (mockCareers as { career_id: string; career_name: string; career_group: string; program: string }[]).find(
      c => c.career_id === dreamCareerId
    );
    if (dreamCareerObj) {
      selectedDreamCareer = {
        id: dreamCareerObj.career_id,
        name: dreamCareerObj.career_name
      };
    }
  }

  const top10_careers = careers;

  // AI top recommendation for mismatch fallback
  const topAiCareer = careers[0];
  const topAiCareerName = topAiCareer ? topAiCareer.career_name : "";
  const topAiCareerLabel = topAiCareer
    ? (CAREER_THAI_NAMES[topAiCareer.career_id] || topAiCareerName)
    : topAiCareerName;

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
            <h1 className="font-syne text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl text-balance leading-tight">
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

          {/* Premium relocated Insights CTA */}
          <Link
            href={`/analytics?user=${userId}`}
            className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-brand-orange/30 bg-white/60 p-4 text-left shadow-sm backdrop-blur-md transition-all hover:scale-[1.02] hover:border-brand-orange/60 hover:shadow-lg hover:shadow-brand-orange/5 dark:bg-white/2 dark:border-white/10 dark:hover:border-brand-orange/40 md:w-80 shrink-0 select-none active:scale-[0.98]"
          >
            {/* Subtle glow background */}
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

        {/* Dream Career Comparison Banner */}
        {(() => {
          if (!selectedDreamCareer) {
            return null;
          }

          const dreamRank = top10_careers.findIndex(c => c.career_id === selectedDreamCareer.id) + 1;
          const isTop3 = dreamRank >= 1 && dreamRank <= 3;
          const isTop10 = dreamRank >= 4 && dreamRank <= 10;
          
          const dreamCareerLabel = selectedDreamCareer.id 
            ? (CAREER_THAI_NAMES[selectedDreamCareer.id] || selectedDreamCareer.name)
            : "";

          if (isTop3) {
            // Condition A: ติด Top 3 (High Match)
            return (
              <div className="mb-10 rounded-3xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 md:p-8 shadow-lg shadow-emerald-500/5 backdrop-blur-md animate-in fade-in duration-500">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
                    <Sparkles className="size-7 text-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        {thai ? "ตรงกันสูง (High Match)" : "High Match"}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {thai ? "เปรียบเทียบกับอาชีพในฝัน" : "Compared to Dream Career"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {thai ? "ยอดเยี่ยม! ทักษะของคุณมาถูกทางแล้ว" : "Excellent! Your skills are on the right track"}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl">
                      {thai 
                        ? `อาชีพในฝัน ${dreamCareerLabel} ของคุณตรงกับผลประเมิน AI ในอันดับที่ ${dreamRank} กดดู Gap Analysis เพื่ออุดรอยรั่วและไปให้ถึงเป้าหมายได้เลย โดยคลิกปุ่ม "Skill Gap Analysis" ที่การ์ดด้านล่าง`
                        : `Your dream career "${dreamCareerLabel}" matches the AI recommendation at rank #${dreamRank}. Click Gap Analysis to close gaps and reach your goal by clicking the "Skill Gap Analysis" button in the card below.`}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/career/${selectedDreamCareer.id}?user=${userId}`)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-700 active:scale-95"
                  >
                    <Rocket className="size-3.5" strokeWidth={2.5} />
                    <span className="leading-relaxed">{thai ? `แผนการเรียนสู่ ${dreamCareerLabel.split(" (")[0]}` : `Roadmap to ${dreamCareerLabel.split(" (")[0]}`}</span>
                    <ArrowRight className="size-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          } else if (isTop10) {
            // Condition B: ติดอันดับ 4-10 (Potential Match)
            return (
              <div className="mb-10 rounded-3xl border border-amber-500/20 bg-linear-to-r from-amber-500/10 via-orange-500/5 to-transparent p-6 md:p-8 shadow-lg shadow-amber-500/5 backdrop-blur-md animate-in fade-in duration-500">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
                    <AlertCircle className="size-7 text-amber-500 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-550 border border-amber-500/30">
                        {thai ? "มีศักยภาพ (Potential Match)" : "Potential Match"}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {thai ? "เปรียบเทียบกับอาชีพในฝัน" : "Compared to Dream Career"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {thai ? "เป็นไปได้สูง! แต่ยังมีทักษะที่ต้องเน้นเพิ่ม" : "Highly Possible! But more skills are needed"}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl">
                      {thai 
                        ? `อาชีพในฝัน ${dreamCareerLabel} ของคุณอยู่ในอันดับที่ ${dreamRank} ของผลประเมิน คุณมีพื้นฐานที่ดี แต่ควรดูรายวิชาแนะนำเพื่อดันตัวเองขึ้นไปติด Top 3 โดยคลิกปุ่ม "Skill Gap Analysis" ที่การ์ดด้านล่าง`
                        : `Your dream career "${dreamCareerLabel}" ranks at #${dreamRank} in our recommendation list. You have a solid baseline, but should view recommended courses to push yourself into the Top 3 by clicking the "Skill Gap Analysis" button in the card below.`}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/career/${selectedDreamCareer.id}?user=${userId}`)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-amber-600 active:scale-95"
                  >
                    <Rocket className="size-3.5" strokeWidth={2.5} />
                    <span className="leading-relaxed">{thai ? `แผนการเรียนสู่ ${dreamCareerLabel.split(" (")[0]}` : `Roadmap to ${dreamCareerLabel.split(" (")[0]}`}</span>
                    <ArrowRight className="size-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          } else {
            // Condition C: ไม่ติด Top 10 เลย (Mismatch / Reality Check)
            return (
              <div className="mb-10 rounded-3xl border border-red-500/20 bg-linear-to-r from-red-500/10 via-rose-500/5 to-transparent p-6 md:p-8 shadow-lg shadow-red-500/5 backdrop-blur-md animate-in fade-in duration-500">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500">
                    <AlertCircle className="size-7 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-500 border border-red-500/30">
                        {thai ? "ไม่ตรงกัน (Mismatch)" : "Mismatch"}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {thai ? "วิเคราะห์ทางเลือกแนะนำ" : "Reality Check"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {thai ? "AI พบเส้นทางอื่นที่อาจเหมาะกับคุณมากกว่าในตอนนี้" : "AI found other paths that might fit you better right now"}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl">
                      {thai 
                        ? `ปัจจุบันอาชีพ ${dreamCareerLabel} ยังไม่ติด Top 10 จากทักษะของคุณ (AI แนะนำ ${topAiCareerLabel} เป็นอันดับแรก) แต่ไม่ต้องห่วง! คุณสามารถใช้ระบบ Simulator จำลองการอัปสกิลเพื่อดูว่าต้องเรียนอะไรเพิ่มบ้าง โดยคลิกปุ่ม "Skill Gap Analysis" ที่การ์ดด้านล่าง`
                        : `Currently the career "${dreamCareerLabel}" is not in the Top 10 based on your skills (AI recommends "${topAiCareerLabel}" first). But don't worry! You can use the Simulator to model upskilling paths by clicking the "Skill Gap Analysis" button in the card below.`}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/career/${selectedDreamCareer.id}?user=${userId}`)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90 active:scale-95"
                  >
                    <Rocket className="size-3.5" strokeWidth={2.5} />
                    <span className="leading-relaxed">{thai ? `แผนการเรียนสู่ ${dreamCareerLabel.split(" (")[0]}` : `Roadmap to ${dreamCareerLabel.split(" (")[0]}`}</span>
                    <ArrowRight className="size-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          }
        })()}



        {/* Selected Dream Career (If not in Top 10) */}
        {!dreamCareerLoading && dreamCareerData && (
          <div className="mb-10 p-6 rounded-3xl border border-brand-orange/15 bg-brand-orange/2 border-dashed animate-in fade-in duration-500">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
              <Heart className="size-4 text-brand-orange" strokeWidth={2.25} aria-hidden />
              {thai ? "อาชีพในฝันที่คุณเลือก (Your Selected Dream Career)" : "Your Selected Dream Career"}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CareerCard
                career={dreamCareerData}
                isTopRank={false}
                track={getTrackForCareer(dreamCareerData)}
                onClick={() => handleCareerClick(dreamCareerData)}
                className="border-brand-orange/30 shadow-lg shadow-brand-orange/5 hover:border-brand-orange/60 hover:shadow-brand-orange/10 dark:hover:shadow-brand-orange/20 bg-white/80 dark:bg-[#070b14]/50 backdrop-blur-md"
              />
            </div>
          </div>
        )}

        {/* Top Matches Section */}
        <div className="mb-12">
          {/* Eyebrow badge from the design image */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 dark:border-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>{thai ? "ปัญญาด้านอาชีพ" : "Career Intelligence"}</span>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="font-syne text-3xl font-black tracking-tight leading-normal text-slate-900 dark:text-white sm:text-4xl">
              {thai ? "อาชีพที่ตรงกับคุณมากที่สุด" : "Top Career Matches"}
            </h2>
            <p className="mt-2.5 mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              {thai 
                ? "เส้นทางที่จัดอันดับอย่างแม่นยำจากโปรไฟล์สมรรถนะของคุณและสัญญาณความต้องการของตลาดแบบเรียลไทม์" 
                : "Paths precisely ranked based on your competency profile and real-time market demand signals."}
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Card #1 (Top Match) spans 2 columns */}
            {top3[0] && (
              <CareerCard
                career={top3[0]}
                isTopRank={true}
                isHero={true}
                track={getTrackForCareer(top3[0])}
                onClick={() => handleCareerClick(top3[0])}
                className="h-full"
              />
            )}
            
            {/* Cards #2 and #3 stack vertically in the remaining 1 column */}
            <div className="flex flex-col gap-6">
              {top3.slice(1, 3).map((career) => (
                <CareerCard
                  key={career.career_id}
                  career={career}
                  isTopRank={true}
                  isHero={false}
                  track={getTrackForCareer(career)}
                  onClick={() => handleCareerClick(career)}
                  className="flex-1"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* SUT Curriculum Track funnel — drill-down detail (Screen 2) */}
        {careers.length > 0 && (
          <CurriculumTrackFunnel careers={careers} userId={userId} />
        )}

        {/* Login hook — appears once Top 3 are revealed (guest → save & unlock) */}
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

        {/* Remaining */}
        {rest.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
              {thai ? `อันดับที่ 4 – ${3 + rest.length} (Ranks 4 – ${3 + rest.length})` : `Ranks 4 – ${3 + rest.length}`}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((career) => (
                <CareerCard
                  key={career.career_id}
                  career={career}
                  isTopRank={false}
                  track={getTrackForCareer(career)}
                  onClick={() => handleCareerClick(career)}
                  className="transition-all duration-300 hover:scale-[1.02]"
                />
              ))}
            </div>
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

      <Footer />
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
