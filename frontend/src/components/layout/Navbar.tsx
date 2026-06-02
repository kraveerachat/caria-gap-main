'use client';

import { useEffect, useState } from "react"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from "motion/react"
import { Check, ArrowRight } from 'lucide-react';
import { STEPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/language-provider"

/** Determine which step index (0-based) is active based on pathname */
function getActiveStep(pathname: string): number {
  if (pathname.startsWith('/career/')) return 2; // Step 3 ("ปิด Gap")
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (pathname.startsWith(STEPS[i].path)) return i;
  }
  return -1;
}

export default function Navbar() {
  const pathname = usePathname();
  const activeIdx = getActiveStep(pathname);
  const [scrolled, setScrolled] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
    >
      <div className="mx-auto flex max-w-6xl w-full items-center justify-between text-slate-900 dark:text-slate-100">
        <Link href="/" className="pl-2">
          <Logo />
          <span className="sr-only">SUT-CARIA home</span>
        </Link>

        {/* Step progress indicator */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Progress">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < activeIdx;
            const isActive = idx === activeIdx;
            const isFuture = idx > activeIdx;

            return (
              <div key={step.id} className="flex items-center">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={cn(
                      'w-4 md:w-6 h-px mx-1 transition-colors duration-300',
                      isCompleted || isActive
                        ? 'bg-brand-orange/60'
                        : 'bg-slate-300 dark:bg-white/10',
                    )}
                  />
                )}

                {/* Step circle + label */}
                <Link
                  href={step.path}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors group/step"
                >
                  <div
                    className={cn(
                       'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                       'transition-all duration-300 border',
                       isCompleted && 'bg-slate-100 dark:bg-white/5 border-slate-350 dark:border-white/10 text-slate-500 dark:text-white/40 shadow-sm',
                       isActive && 'bg-brand-orange border-brand-orange text-brand-orange-foreground shadow-lg shadow-brand-orange/30 animate-pulse-glow',
                       isFuture && 'border-slate-300 dark:border-white/20 text-slate-400 dark:text-white/40 group-hover/step:border-slate-500 group-hover/step:text-slate-600 dark:group-hover/step:border-white/50 dark:group-hover/step:text-white/80',
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-slate-500 dark:text-white/40" strokeWidth={3} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium whitespace-nowrap transition-colors duration-300',
                      isCompleted && 'text-slate-400 dark:text-white/30',
                      isActive && 'text-brand-orange',
                      isFuture && 'text-slate-500 dark:text-white/40',
                    )}
                  >
                    {step.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Actions (Insights, Language, Theme, Reset, Start) */}
        <div className="flex items-center gap-2">

          <LanguageToggle />
          <ThemeToggle onTop={false} />
          {pathname.startsWith("/career/") ? (
            <>
              <button
                type="button"
                onClick={() => {
                  alert("บันทึกแผนการเรียนสำเร็จ! ระบบกำลังนำคุณกลับไปยังหน้าผลลัพธ์อาชีพ...");
                  window.location.href = `/dashboard`;
                }}
                className="group hidden items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-brand-orange-foreground shadow-[0_10px_30px_-8px_rgba(243,146,0,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-95 sm:inline-flex"
              >
                <span>บันทึกแผนการเรียน (Save Roadmap)</span>
              </button>
              <div className="flex items-center justify-center size-9 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold select-none text-xs">
                JD
              </div>
            </>
          ) : (
            <>
              <Link
                href="/assessment"
                className="group hidden items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-brand-orange-foreground shadow-[0_10px_30px_-8px_rgba(243,146,0,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-95 sm:inline-flex"
              >
                {t.nav.start}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
