"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/components/language-provider";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingCard } from "@/components/assessment/OnboardingCard";
import { DreamCareerSelectCard } from "@/components/assessment/DreamCareerSelectCard";
import { GamifiedQuiz } from "@/components/assessment/GamifiedQuiz";
import { getAnonId } from "@/lib/anon-id";
import { MOCK_TOP10 } from "@/lib/mockData";
import { rankCareers } from "@/lib/gap-analysis";
import type { CareerResult, Top10Response } from "@/types";
import mockCareers from "@/lib/mock_careers.json";

export default function AssessmentPage() {
  const router = useRouter();
  
  // Quiz states
  const [step, setStep] = useState<"dream_career" | "onboarding" | "quiz_81">("dream_career");
  const [dreamCareerId, setDreamCareerId] = useState<string>("");
  const [dreamCareerGroup, setDreamCareerGroup] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { lang, t } = useLanguage();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const careerId = params.get("career");
      if (careerId) {
        const found = (mockCareers as any[]).find((c) => c.career_id === careerId);
        if (found) {
          setDreamCareerId(found.career_id);
          setDreamCareerGroup(found.career_group);
          
          // Persist immediately
          const selectedObj = { id: found.career_id, name: found.career_name, group: found.career_group };
          localStorage.setItem("dreamCareer", JSON.stringify(selectedObj));
          localStorage.setItem("user_dream_career", JSON.stringify(selectedObj));
          localStorage.setItem("caria_dream_career_id", found.career_id);
          localStorage.setItem("caria_dream_career_group", found.career_group);
          
          setStep("onboarding");
        }
      }
    }
  }, []);

  // Prototype convenience: jump straight to the dashboard with mock results
  // so testers don't have to complete the assessment every time.
  const handleSkipDemo = () => {
    if (typeof window !== "undefined") {
      // 1. Determine the selected career from localStorage, state, or fallback to DT08
      let storedId = "DT08";
      let storedGroup = "Enterprise Software";
      let storedName = "Software Developer";

      const localDream = localStorage.getItem("user_dream_career") || localStorage.getItem("dreamCareer");
      if (localDream) {
        try {
          const parsed = JSON.parse(localDream);
          if (parsed && parsed.id) {
            storedId = parsed.id;
            storedGroup = parsed.group || "";
            storedName = parsed.name || "";
          }
        } catch (e) {
          // ignore
        }
      } else {
        const flatId = localStorage.getItem("caria_dream_career_id") || dreamCareerId;
        const flatGroup = localStorage.getItem("caria_dream_career_group") || dreamCareerGroup;
        if (flatId) {
          storedId = flatId;
          storedGroup = flatGroup || "";
          const found = (mockCareers as any[]).find((c) => c.career_id === flatId);
          storedName = found ? found.career_name : "";
        }
      }

      // 2. Set all necessary localStorage states
      const selectedObj = { id: storedId, name: storedName, group: storedGroup };
      localStorage.setItem("dreamCareer", JSON.stringify(selectedObj));
      localStorage.setItem("user_dream_career", JSON.stringify(selectedObj));
      localStorage.setItem("caria_dream_career_id", storedId);
      localStorage.setItem("caria_dream_career_group", storedGroup);

      const skippedResults = {
        ...MOCK_TOP10,
        dream_career_id: storedId,
        dream_career_group: storedGroup,
      };
      localStorage.setItem("caria_top10", JSON.stringify(skippedResults));
    }
    router.push("/dashboard?user=demo_ton");
  };

  // Submit from the 81-question quiz — fully client-side. The MES ranking is
  // computed from the student's answers and persisted to localStorage; the
  // dashboard reads it from there. No backend POST and no next-auth dependency,
  // so the native flow behaves exactly like "Skip to Dashboard" on Vercel.
  const handleQuizComplete = (compiledScores: Record<string, number>) => {
    setIsSubmitting(true);
    try {
      // Stable per-browser key so guest results stay claimable after sign-in.
      const userId = getAnonId() || `user_81_${Date.now()}`;
      const actualId = dreamCareerId || "";
      const actualGroup = dreamCareerGroup || "";
      const found = (mockCareers as any[]).find((c) => c.career_id === actualId);
      const selectedObj = { id: actualId, name: found ? found.career_name : "", group: actualGroup };

      // Rank all 78 careers client-side via the MES engine; fall back to the
      // bundled mock results if the computation ever throws.
      let topCareers: CareerResult[];
      try {
        topCareers = rankCareers(compiledScores).slice(0, 10);
        if (topCareers.length === 0) topCareers = MOCK_TOP10.top10_careers;
      } catch (err) {
        console.warn("Client-side ranking failed; using mock results", err);
        topCareers = MOCK_TOP10.top10_careers;
      }

      const results: Top10Response = {
        assessment_id: `ASM_${userId}`,
        user_id: userId,
        timestamp: new Date().toISOString(),
        top10_careers: topCareers,
        dream_career_id: actualId || undefined,
        dream_career_group: actualGroup || undefined,
      };

      localStorage.setItem("dreamCareer", JSON.stringify(selectedObj));
      localStorage.setItem("user_dream_career", JSON.stringify(selectedObj));
      localStorage.setItem("caria_top10", JSON.stringify(results));
      localStorage.setItem("caria_dream_career_id", actualId);
      localStorage.setItem("caria_dream_career_group", actualGroup);
      // The canonical input the dashboard's MES engine + radar read back.
      localStorage.setItem("user_custom_scores", JSON.stringify(compiledScores));

      router.push(`/dashboard?user=${userId}`);
    } catch (err) {
      // Last-resort failsafe: never strand the user on the quiz screen.
      console.error("Quiz completion failed; routing to the demo dashboard", err);
      router.push("/dashboard?user=user_81_demo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      <SiteHeader />

      {/* Prototype quick-skip to dashboard (testing convenience) */}
      <button
        onClick={handleSkipDemo}
        className="fixed top-20 right-4 z-40 rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-bold text-muted-foreground shadow-lg backdrop-blur transition-colors hover:border-brand-orange/50 hover:text-brand-orange"
      >
        {lang === "th" ? "ข้ามไปดู Dashboard (เดโม) →" : "Skip to Dashboard (demo) →"}
      </button>

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
      {/* Cool glow behind the nexus (right) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 55% 60% at 74% 48%, rgba(45,156,255,0.08) 0%, transparent 65%)",
        }}
      />
      {/* Warm glow behind the headline (left) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 45% 55% at 18% 42%, rgba(243,146,0,0.08) 0%, transparent 68%)",
        }}
      />

      <main className="flex-1 relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-20 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* Step 2: Dream Career Selection */}
          {step === "dream_career" && (
            <motion.div
              key="dream_career"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full"
            >
              <DreamCareerSelectCard
                onContinue={(id, group) => {
                  setDreamCareerId(id);
                  setDreamCareerGroup(group);
                  if (typeof window !== "undefined") {
                    const found = (mockCareers as any[]).find((c) => c.career_id === id);
                    const name = found ? found.career_name : "";
                    const selectedObj = { id, name, group };
                    localStorage.setItem("dreamCareer", JSON.stringify(selectedObj));
                    localStorage.setItem("user_dream_career", JSON.stringify(selectedObj));
                    localStorage.setItem("caria_dream_career_id", id);
                    localStorage.setItem("caria_dream_career_group", group);
                  }
                  setStep("onboarding");
                }}
                lang={lang}
              />
            </motion.div>
          )}

          {/* Step 3: Onboarding & Consent Screen */}
          {step === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full"
            >
              <OnboardingCard
                onStart={() => setStep("quiz_81")}
                lang={lang}
              />
            </motion.div>
          )}

          {/* Step 4: 10 Questions Quiz Screen */}
          {step === "quiz_81" && (
            <motion.div
              key="quiz_81"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full"
            >
              <GamifiedQuiz
                onComplete={handleQuizComplete}
                onBack={() => setStep("onboarding")}
                onSkip={handleSkipDemo}
                lang={lang}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  );
}
