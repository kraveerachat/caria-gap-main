"use client";

import { useState } from "react";
import { Shield, Sparkles, CheckCircle2, ChevronRight, PlayCircle, ExternalLink } from "lucide-react";

interface OnboardingCardProps {
  onStart: () => void;
  lang: "th" | "en";
}

export function OnboardingCard({ onStart, lang }: OnboardingCardProps) {
  const [agreed, setAgreed] = useState(false);
  const thai = lang === "th";

  return (
    <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white/70 p-6 md:p-8 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0f1d]/75 shadow-2xl">
      
      {/* Badge Header */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-orange/20 bg-brand-orange/10">
          <Sparkles size={16} className="text-brand-orange animate-pulse" />
          <span className="text-xs font-bold text-brand-orange">
            {thai ? "การวิเคราะห์ประเมินสมรรถนะระดับสูง" : "Advanced Competency Evaluation"}
          </span>
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">
          {thai ? "แบบทดสอบประเมินตนเอง 81 ข้อ" : "81-Question Self-Assessment"}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {thai
            ? "แบบประเมินสมรรถนะเชิงลึก 81 ข้อ ครอบคลุมทั้ง Skills, Attitudes, และ Knowledge ใช้เวลาประมาณ 10-15 นาที"
            : "In-depth evaluation of 81 questions covering Skills, Attitudes, and Knowledge. Takes about 10-15 minutes."}
        </p>
      </div>

      {/* Research Stat Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-white/5 dark:bg-white/2 flex flex-col justify-center text-center">
          <span className="text-4xl font-extrabold text-brand-orange font-syne">83%</span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            {thai ? "ความแม่นยำ Precision@10" : "Precision@10 Accuracy"}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {thai ? "ผ่านการพิสูจน์ตามงานวิจัย Scopus 2024" : "Proven by Scopus 2024 Research"}
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-white/5 dark:bg-white/2 flex flex-col justify-center text-center">
          <span className="text-4xl font-extrabold text-blue-400 font-syne">MES</span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            {thai ? "สมการความคล้ายคลึงแบบถ่วงน้ำหนัก" : "Weighted Similarity Equation"}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {thai ? "Modified Euclidean Similarity" : "Modified Euclidean Similarity metric"}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-8 p-5 rounded-2xl bg-brand-orange/5 border border-brand-orange/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-3">
          {thai ? "สิ่งที่คุณจะได้รับจากรายงานนี้:" : "What you will receive from this report:"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            thai ? "อันดับ Top-3 อาชีพดิจิทัลที่เหมาะสมที่สุด" : "Top-3 best matching digital careers",
            thai ? "การวิเคราะห์จุดอ่อน (Gaps) 3 มิติเชิงลึก" : "In-depth 3-axis competency gap analysis",
            thai ? "หลักสูตรรายวิชา มทส. และคอร์สปิดช่องว่าง" : "SUT courses & upskilling recommendations",
            thai ? "ไทม์ไลน์โรดแมปแผนพัฒนาอาชีพรายบุคคล" : "Personalized career roadmap timeline"
          ].map((text, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle2 size={14} className="text-success" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PDPA Consent Checkbox */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/50 mb-8 transition-all">
        <div className="flex gap-3">
          <div className="mt-0.5 text-brand-orange">
            <Shield size={18} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              {thai ? "การคุ้มครองข้อมูลส่วนบุคคล (PDPA Consent)" : "Data Privacy Protection (PDPA)"}
            </h4>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {thai
                ? "ข้อมูลคำตอบและเรซูเมของคุณจะนำไปใช้ในการประมวลผลอัลกอริทึมแนะนำอาชีพ และจะไม่ถูกเผยแพร่แก่ภายนอกโดยไม่ได้รับอนุญาต คุณสามารถใช้สิทธิ์ขอลบข้อมูลทั้งหมดผ่านแถบเมนูหลักได้ตลอดเวลา"
                : "Your answers and resume details are used strictly to run the career matching engine. You can purge your personal logs anytime using the header menu."}
            </p>
            
            <label className="mt-4 flex items-center gap-2 select-none group cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="size-4 rounded border-slate-300 dark:border-white/10 accent-brand-orange"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-orange transition-colors">
                {thai
                  ? "ฉันยินยอมให้นำข้อมูลไปวิเคราะห์ความสอดคล้องทางวิชาชีพ"
                  : "I consent to having my details analyzed for professional matching"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* CTA Trigger */}
      <button
        onClick={onStart}
        disabled={!agreed}
        className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
          agreed
            ? "bg-brand-orange text-white hover:scale-[1.02] hover:shadow-brand-orange/20 active:scale-98"
            : "bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed"
        }`}
      >
        <span>{thai ? "เริ่มต้นทำแบบทดสอบความสอดคล้อง" : "Begin Competency Assessment"}</span>
        <ChevronRight size={16} />
      </button>

    </div>
  );
}
