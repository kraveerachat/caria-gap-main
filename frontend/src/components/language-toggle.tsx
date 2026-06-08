"use client"

import { useLanguage, type Lang } from "@/components/language-provider"
import { cn } from "@/lib/utils"

const OPTIONS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "th", label: "TH" },
]

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex h-10 items-center gap-0.5 rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/10">
      {OPTIONS.map((opt) => {
        const active = lang === opt.code
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLang(opt.code)}
            aria-pressed={active}
            className={cn(
              "flex h-full items-center rounded-full px-3 text-xs font-semibold transition-colors",
              active
                ? "bg-[#F39200] text-black shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
