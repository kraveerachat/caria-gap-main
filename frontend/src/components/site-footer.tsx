"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

export function SiteFooter() {
  const { t, lang } = useLanguage()
  
  const COLUMNS = [
    {
      title: t.footer.product,
      links: [
        { label: t.footer.howItWorks, href: "#how-it-works" },
        { label: t.footer.assessment, href: "/assessment" },
        { label: t.footer.publicTrends, href: "/analytics" },
        { label: t.footer.b2bPortal, href: "/b2b-portal" },
      ]
    },
    {
      title: t.footer.company,
      links: [
        { label: t.footer.aboutSUT, href: "#" },
        { label: t.footer.researchPlan, href: "#" },
        { label: t.footer.contact, href: "#" },
      ]
    },
    {
      title: t.footer.resources,
      links: [
        { label: t.footer.competencyMap, href: "#" },
        { label: t.footer.privacyPolicy, href: "#" },
        { label: t.footer.termsOfService, href: "#" },
      ]
    },
  ]

  return (
    <footer className="relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-black dark:text-white transition-colors duration-300">
      {/* Final CTA */}
      <div className="relative mx-auto max-w-5xl px-6 py-28 text-center sm:py-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(243,146,0,0.18)_0%,_transparent_65%)] blur-3xl"
        />
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`relative text-balance text-4xl font-semibold sm:text-6xl ${
            lang === "th" ? "leading-normal tracking-normal" : "leading-tight tracking-tight"
          }`}
        >
          {t.footer.ctaTitle1}
          <br />
          <span className="text-brand-orange">{t.footer.ctaTitle2}</span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mt-12 sm:mt-16"
        >
          <a
            href="#assessment"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-sm font-semibold text-brand-orange-foreground shadow-[0_18px_55px_-12px_rgba(243,146,0,0.7)] transition-transform duration-300 hover:scale-[1.04] active:scale-95"
          >
            {t.footer.ctaButton}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>

      {/* Links */}
      <div className="relative border-t border-slate-200 dark:border-white/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-white/50">
              {t.footer.desc}
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-500 dark:text-white/50 transition-colors hover:text-brand-orange dark:hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-slate-200 dark:border-white/10 px-6 py-6 text-xs text-slate-400 dark:text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
          <p>{t.footer.builtFor}</p>
        </div>
      </div>
    </footer>
  )
}
