"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Brain, Clock, Target, Cpu, ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const HIGHLIGHTS = [
  { Icon: Clock, th: "ใช้เวลาเพียง 10–15 นาที", en: "Only 10–15 minutes" },
  { Icon: Target, th: "ความแม่นยำสูง (Precision@10)", en: "High precision (Precision@10)" },
  { Icon: Cpu, th: "วิเคราะห์ด้วย AI", en: "AI-powered analysis" },
] as const

export function AssessmentMockup() {
  const { lang } = useLanguage()
  const thai = lang === "th"

  return (
    <section id="assessment" className="relative overflow-hidden bg-slate-50 py-28 dark:bg-slate-950 sm:py-36">
      {/* Ambient accents — SUT Navy + Orange */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-1/3 size-72 rounded-full bg-brand-orange/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-1/4 size-72 rounded-full bg-[#002F6C]/10 blur-3xl dark:bg-[#002F6C]/25" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-[0_30px_80px_-40px_rgba(0,16,40,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 md:p-12"
        >
          {/* Decorative glow behind the icon */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-20 mx-auto h-48 w-48 rounded-full bg-brand-orange/20 blur-3xl" />

          {/* Floating brain orb */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative flex justify-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-orange shadow-[0_0_30px_rgba(243,146,0,0.4)]">
              <Brain className="size-10 text-[#1a1100]" strokeWidth={2.25} />
            </div>
          </motion.div>

          {/* Pre-title badge */}
          <p className="mt-5 text-center font-heading text-xs font-bold uppercase tracking-[0.22em] text-brand-orange">
            In-Depth Evaluation
          </p>

          {/* Headline */}
          <h2
            className={`mb-2 mt-2 text-center text-3xl font-bold tracking-tight text-balance text-slate-900 dark:text-white md:text-4xl ${thai ? "font-thai leading-relaxed" : "font-heading leading-tight"}`}
          >
            {thai ? "แบบทดสอบประเมินตนเอง 81 ข้อ" : "81-Question Self Assessment"}
          </h2>

          {/* Subtitle */}
          <p
            className={`mx-auto mb-8 max-w-2xl text-center font-medium text-slate-600 dark:text-slate-300 ${thai ? "font-thai leading-loose" : "leading-relaxed"}`}
          >
            {thai
              ? "วิเคราะห์และจับคู่สมรรถนะของตัวคุณ เพื่อค้นหาคำแนะนำสายอาชีพดิจิทัลและรายวิชาที่ตรงความต้องการ"
              : "Maps your competency profile against digital careers and recommended courses in real time."}
          </p>

          {/* Value highlights */}
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ Icon, th, en }) => (
              <div
                key={en}
                className={`flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 text-center text-sm font-semibold text-slate-700 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 ${thai ? "font-thai leading-relaxed" : ""}`}
              >
                <Icon className="size-4 shrink-0 text-brand-orange" strokeWidth={2.25} aria-hidden />
                <span>{thai ? th : en}</span>
              </div>
            ))}
          </div>

          {/* Grand CTA */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/assessment"
              className={`group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-10 py-4 text-center text-lg font-bold text-brand-orange-foreground shadow-[0_18px_44px_-12px_rgba(243,146,0,0.6)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_22px_56px_-12px_rgba(243,146,0,0.8)] active:scale-95 sm:w-auto ${thai ? "font-thai leading-relaxed" : ""}`}
            >
              {thai ? "เริ่มทำแบบทดสอบ (Start Assessment)" : "Start Assessment"}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
