"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ArrowRight, Menu, X, User } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/language-provider"

const NAV = [
  { key: "howItWorks", href: "/home#how-it-works" },
  { key: "assessment", href: "/home#assessment" },
  { key: "results", href: "/home#results" },
  { key: "simulator", href: "/home#simulator" },
] as const

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const sessionUser = status === "authenticated" ? session?.user : null

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
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2.5 transition-all duration-500",
          scrolled
            ? "bg-white/75 dark:bg-[#0a0f1c]/70 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-[0_8px_40px_-12px_rgba(0,16,40,0.25)] dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] text-slate-900 dark:text-slate-100"
            : "border border-transparent text-slate-900 dark:text-slate-100",
        )}
      >
        <Link href="/home" className="pl-2">
          <Logo />
          <span className="sr-only">SUT-CARIA home</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                scrolled
                  ? "text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              {t.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle onTop={false} />
          {sessionUser ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-[9rem] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {sessionUser.name ?? "Account"}
              </span>
              <button
                type="button"
                onClick={() => signOut({ redirect: false })}
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/assessment"
            className="group hidden items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-brand-orange-foreground shadow-[0_10px_30px_-8px_rgba(243,146,0,0.6)] transition-transform duration-300 hover:scale-[1.04] active:scale-95 sm:inline-flex"
          >
            {t.nav.start}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/settings"
            aria-label="บัญชีและการตั้งค่า"
            title="บัญชีและการตั้งค่า"
            className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <User className="size-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full border md:hidden",
              scrolled
                ? "border-slate-200 text-slate-900 dark:border-white/10 dark:text-white"
                : "border-slate-300/50 text-slate-800 dark:border-white/15 dark:text-white",
            )}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-2 max-w-6xl rounded-3xl border border-slate-200 bg-white/90 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0f1c]/95 md:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5"
              >
                {t.nav[item.key]}
              </a>
            ))}
            <Link
              href="/assessment"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-brand-orange-foreground"
            >
              {t.nav.start} <ArrowRight className="size-4" />
            </Link>
            {sessionUser ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  signOut({ redirect: false })
                }}
                className="mt-1 rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground/80 hover:bg-foreground/5"
              >
                Sign out ({sessionUser.name ?? "Account"})
              </button>
            ) : (
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5"
              >
                Sign in
              </Link>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
