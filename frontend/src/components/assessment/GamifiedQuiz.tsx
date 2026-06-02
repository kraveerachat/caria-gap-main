"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ASSESSMENT_QUESTIONS, QuestionItem } from "@/lib/questions";
import { ArrowLeft, ArrowRight, BrainCircuit, Smile, BookOpen, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

interface GamifiedQuizProps {
  onComplete: (scores: Record<string, number>) => void;
  onBack: () => void;
  onSkip?: () => void;
  lang: "th" | "en";
}

interface ContinuousSliderProps {
  value: number;
  onChange: (val: number) => void;
  domain: QuestionItem["domain"];
  lang: "th" | "en";
  isTouched: boolean;
}

// Custom Slider component with dynamic floating Score Bubble and clean track line
function ContinuousSlider({ value, onChange, domain, lang, isTouched }: ContinuousSliderProps) {
  const thai = lang === "th";
  const bubblePosition = `calc(${value}% + ${(50 - value) * 0.3}px)`;

  const labelLeft = thai ? "ไม่เห็นด้วย (0)" : "Disagree (0)";
  const labelCenter = thai ? "เฉยๆ (50)" : "Neutral (50)";
  const labelRight = thai ? "เห็นด้วย (100)" : "Agree (100)";

  return (
    <div className="w-full max-w-2xl mx-auto pt-8 pb-4 relative select-none">
      {/* Floating score bubble */}
      {isTouched && (
        <div 
          className="absolute top-0 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-brand-orange text-white text-[11px] font-extrabold shadow-md after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-brand-orange transition-all duration-75 z-30"
          style={{ left: bubblePosition }}
        >
          {value}/100
        </div>
      )}
      
      {/* Custom Slider Track & Range Input Wrapper */}
      <div className="relative w-full h-8 flex items-center">
        {/* Custom Underlay Track Line */}
        <div className="absolute left-2 right-2 h-1 bg-slate-200 dark:bg-white/10 rounded-full pointer-events-none" />
        
        {/* Range Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-full bg-transparent appearance-none cursor-pointer z-20 focus:outline-none 
            [&::-webkit-slider-runnable-track]:bg-transparent 
            [&::-moz-range-track]:bg-transparent
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-8 
            [&::-webkit-slider-thumb]:h-8 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:cursor-grab 
            [&::-webkit-slider-thumb]:active:cursor-grabbing 
            [&::-webkit-slider-thumb]:transition-all
            ${isTouched 
              ? "[&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg" 
              : "[&::-webkit-slider-thumb]:bg-slate-400/80 dark:[&::-webkit-slider-thumb]:bg-slate-600 [&::-webkit-slider-thumb]:border-slate-300 dark:[&::-webkit-slider-thumb]:border-slate-500 [&::-webkit-slider-thumb]:opacity-60"
            }
            [&::-moz-range-thumb]:w-8 
            [&::-moz-range-thumb]:h-8 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:border-2 
            [&::-moz-range-thumb]:cursor-grab 
            [&::-moz-range-thumb]:active:cursor-grabbing
            ${isTouched
              ? "[&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
              : "[&::-moz-range-thumb]:bg-slate-400/80 dark:[&::-moz-range-thumb]:bg-slate-600 [&::-moz-range-thumb]:border-slate-300 dark:[&::-moz-range-thumb]:border-slate-500 [&::-moz-range-thumb]:opacity-60"
            }
          `}
        />
      </div>

      {/* Dynamic Endpoint/Center Labels */}
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold tracking-wider font-thai">
        <span className="text-left w-1/3">{labelLeft}</span>
        <span className="text-center w-1/3">{labelCenter}</span>
        <span className="text-right w-1/3">{labelRight}</span>
      </div>
    </div>
  );
}

export function GamifiedQuiz({ onComplete, onBack, onSkip, lang }: GamifiedQuizProps) {
  const thai = lang === "th";
  
  // Section States: skill, attitude, knowledge
  const [currentSection, setCurrentSection] = useState<"skill" | "attitude" | "knowledge">("skill");
  
  // Set to track which questions have been touched/slid by the user
  const [touchedQuestions, setTouchedQuestions] = useState<Set<number>>(new Set());

  // Answers mapping question ID to score value (0-100). Default neutral is 50.
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    ASSESSMENT_QUESTIONS.forEach((q) => {
      init[q.id] = 50;
    });
    return init;
  });

  // Encouraging transition screen overlay states
  const [showTransition, setShowTransition] = useState(false);
  const [pendingSection, setPendingSection] = useState<"attitude" | "knowledge" | null>(null);

  const activeQuestions = ASSESSMENT_QUESTIONS.filter(q => q.domain === currentSection);
  const totalQuestions = ASSESSMENT_QUESTIONS.length;

  const activeQuestionsAnsweredCount = activeQuestions.filter(q => touchedQuestions.has(q.id)).length;
  const isAllAnswered = activeQuestionsAnsweredCount === activeQuestions.length;

  const handleSliderChange = (questionId: number, val: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    setTouchedQuestions((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  };

  const handleNextSection = () => {
    if (!isAllAnswered) return;
    
    if (currentSection === "skill") {
      setPendingSection("attitude");
      setShowTransition(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentSection === "attitude") {
      setPendingSection("knowledge");
      setShowTransition(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onComplete(compileScores(answers));
    }
  };

  const handlePrevSection = () => {
    if (currentSection === "attitude") {
      setCurrentSection("skill");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentSection === "knowledge") {
      setCurrentSection("attitude");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onBack();
    }
  };

  // Compile individual question scores into averages for 66 competencies
  const compileScores = (ans: Record<number, number>): Record<string, number> => {
    const totals: Record<string, number[]> = {};
    ASSESSMENT_QUESTIONS.forEach((q) => {
      const score = ans[q.id] !== undefined ? ans[q.id] : 50;
      if (!totals[q.competencyId]) {
        totals[q.competencyId] = [];
      }
      totals[q.competencyId].push(score);
    });

    const result: Record<string, number> = {};
    Object.keys(totals).forEach((compKey) => {
      const arr = totals[compKey];
      const sum = arr.reduce((a, b) => a + b, 0);
      result[compKey] = Math.round(sum / arr.length);
    });
    return result;
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete(compileScores(answers));
    }
  };

  const getDomainIcon = (domain: QuestionItem["domain"]) => {
    switch (domain) {
      case "skill": return <BrainCircuit size={18} className="text-blue-500" />;
      case "attitude": return <Smile size={18} className="text-purple-500" />;
      case "knowledge": return <BookOpen size={18} className="text-brand-orange" />;
    }
  };

  const getDomainTitle = (domain: "skill" | "attitude" | "knowledge") => {
    if (domain === "skill") return thai ? "ด้านทักษะ (Skills)" : "Skills Section";
    if (domain === "attitude") return thai ? "ด้านทัศนคติวิชาชีพ (Attitudes)" : "Attitudes Section";
    return thai ? "ด้านความรู้ดิจิทัล (Knowledge)" : "Knowledge Section";
  };

  // Progress Bar Steps Info
  const progressSteps = [
    { key: "skill", titleTh: "ทักษะ (Skills)", titleEn: "Skills", count: 35 },
    { key: "attitude", titleTh: "ทัศนคติ (Attitudes)", titleEn: "Attitudes", count: 12 },
    { key: "knowledge", titleTh: "ความรู้ (Knowledge)", titleEn: "Knowledge", count: 34 }
  ];

  // If in section switch transition
  if (showTransition && pendingSection) {
    const isToAttitude = pendingSection === "attitude";
    return (
      <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white/70 p-8 md:p-10 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0f1d]/75 shadow-2xl text-center flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-300">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange mb-6">
          <Sparkles className="size-10 animate-bounce" />
        </div>
        
        <h3 className="mb-4 font-syne text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
          {thai ? "ยอดเยี่ยมมาก!" : "Excellent Job!"}
        </h3>
        
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-lg mb-8 leading-relaxed font-semibold">
          {isToAttitude
            ? (thai
                ? "เราวิเคราะห์ทักษะดิจิทัล (Skills) ของคุณเสร็จเรียบร้อยแล้ว ต่อไปมาสำรวจทัศนคติวิชาชีพ (Attitudes) กันต่อ"
                : "We have finished evaluating your digital skills. Next, let's explore your professional attitudes.")
            : (thai
                ? "ทัศนคติวิชาชีพ (Attitudes) ผ่านพ้นไปด้วยดีแล้ว! สุดท้ายมาวัดระดับความรู้ทางเทคนิคดิจิทัล (Knowledge) กัน"
                : "Attitudes section completed successfully! Finally, let's assess your technical digital knowledge.")}
        </p>

        <button
          onClick={() => {
            setCurrentSection(pendingSection);
            setShowTransition(false);
          }}
          className="flex items-center gap-2 rounded-full bg-brand-orange px-8 py-3.5 font-bold text-white shadow-lg shadow-brand-orange/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <span>{thai ? "ลุยต่อเลย!" : "Continue!"}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[60vh] w-full">
      
      {/* Top Header & Fast Skip */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevSection}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all pointer-events-auto"
            title={thai ? "ย้อนกลับ" : "Back"}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
            {getDomainTitle(currentSection)}
          </h2>
        </div>
        <button
          onClick={handleSkip}
          title={thai ? "ข้ามไปดูผลลัพธ์เลย (เดโม)" : "Skip to results (demo)"}
          className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:border-brand-orange/50 hover:text-brand-orange dark:border-white/10 dark:text-slate-400"
        >
          {thai ? "ข้ามไปดูผล ⏩" : "Skip to results ⏩"}
        </button>
      </div>

      {/* 3-Segment Progress Indicator */}
      <div className="grid grid-cols-3 gap-4 mb-10 select-none">
        {progressSteps.map((stepInfo, idx) => {
          const isCompleted = 
            (stepInfo.key === "skill" && currentSection !== "skill") ||
            (stepInfo.key === "attitude" && currentSection === "knowledge");
          const isActive = stepInfo.key === currentSection;
          
          return (
            <div key={stepInfo.key} className="flex flex-col gap-2">
              <div className="h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-white/5 border border-slate-300/30 dark:border-white/5 relative">
                {isCompleted && (
                  <div className="absolute inset-0 bg-emerald-500 transition-all duration-500" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeSectionProgress"
                    className="absolute inset-0 bg-linear-to-r from-brand-orange to-amber-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
              <div className="flex items-center justify-center gap-1">
                {isCompleted && <CheckCircle2 size={12} className="text-emerald-500" />}
                <span className={`text-[10px] md:text-xs font-bold transition-colors ${
                  isActive ? "text-brand-orange" : isCompleted ? "text-emerald-500" : "text-slate-400"
                }`}>
                  {thai ? stepInfo.titleTh : stepInfo.titleEn} ({stepInfo.count} {thai ? "ข้อ" : "Q"})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Long Scrollable Questions List for active domain */}
      <div className="flex-1 flex flex-col gap-6 w-full mb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6 w-full"
          >
            {activeQuestions.map((q, idx) => {
              // Find sequential question number (1-81)
              const globalIdx = ASSESSMENT_QUESTIONS.findIndex(item => item.id === q.id) + 1;
              return (
                <div 
                  key={q.id} 
                  className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 md:p-8 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0f1d]/75 shadow-lg flex flex-col text-center w-full transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20"
                >
                  {/* Domain Icon & Badge */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="inline-flex items-center justify-center p-2 rounded-full bg-slate-100 dark:bg-white/5">
                      {getDomainIcon(q.domain)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {thai ? `ข้อที่ ${globalIdx} จาก 81` : `Question ${globalIdx} of 81`}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white max-w-2xl mx-auto mb-6 leading-relaxed">
                    {thai ? q.textTh : q.textEn}
                  </h3>

                  {/* Score Slider */}
                  <ContinuousSlider
                    value={answers[q.id]}
                    onChange={(val) => handleSliderChange(q.id, val)}
                    domain={q.domain}
                    lang={lang}
                    isTouched={touchedQuestions.has(q.id)}
                  />
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Large Centered Touch-Validated Action Button */}
      <div className="flex flex-col items-center mt-12 mb-20 w-full select-none">
        <button
          onClick={handleNextSection}
          disabled={!isAllAnswered}
          className={`w-full max-w-xl py-4.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md py-4 ${
            isAllAnswered
              ? "bg-brand-orange text-white hover:bg-brand-orange/95 hover:scale-[1.02] active:scale-98 cursor-pointer shadow-brand-orange/10"
              : "bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-600 cursor-not-allowed border border-slate-300/30 dark:border-white/5"
          }`}
        >
          <span>
            {isAllAnswered
              ? (currentSection === "knowledge" 
                  ? (thai ? "ส่งแบบประเมิน (Submit Assessment)" : "Submit Assessment")
                  : (currentSection === "skill"
                      ? (thai ? "ไปต่อส่วนที่ 2: Attitudes (Next Section)" : "Continue to Part 2: Attitudes (Next Section)")
                      : (thai ? "ไปต่อส่วนที่ 3: Knowledge (Next Section)" : "Continue to Part 3: Knowledge (Next Section)")
                    )
                )
              : (thai 
                  ? `ตอบคำถามให้ครบทุกข้อเพื่อไปต่อ (${activeQuestionsAnsweredCount}/${activeQuestions.length})`
                  : `Please answer all questions to continue (${activeQuestionsAnsweredCount}/${activeQuestions.length})`
                )
            }
          </span>
          {isAllAnswered && <ChevronRight size={18} />}
        </button>
      </div>

    </div>
  );
}
