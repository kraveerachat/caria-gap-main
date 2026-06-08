"use client";

/**
 * Guest sign-in mockup (route "/signin-guest"), reached from the gateway's
 * "Guest / High-school student" branch. Offers mocked Google / Facebook sign-in
 * (no real OAuth) plus a "continue as guest" escape hatch. Either way the visitor
 * is marked as a guest and sent into the assessment.
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { setMockRole } from "@/hooks/useMockAuth";
import { GlobeBackdrop } from "@/components/GlobeBackdrop";

const COPY = {
  th: {
    back: "ย้อนกลับ",
    badge: "บุคคลทั่วไป / นักเรียนมัธยม",
    heading: "เข้าสู่ระบบเพื่อบันทึกผลของคุณ",
    sub: "เข้าสู่ระบบเพื่อเก็บผลการประเมินและสถิติไว้กับบัญชีของคุณ หรือจะดำเนินการต่อแบบผู้เยี่ยมชมก็ได้",
    or: "หรือ",
    continueGuest: "ดำเนินการต่อแบบผู้เยี่ยมชม",
    note: "เดโม: ปุ่มเข้าสู่ระบบเป็นการจำลอง ยังไม่เชื่อมต่อ OAuth จริง",
  },
  en: {
    back: "Back",
    badge: "Guest / High-school student",
    heading: "Sign in to save your results",
    sub: "Sign in to keep your assessment results with your account, or continue as a guest.",
    or: "or",
    continueGuest: "Continue as a guest",
    note: "Demo: sign-in buttons are mocked, no real OAuth is connected.",
  },
} as const;

export default function GuestSignInPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const thai = lang === "th";
  const t = thai ? COPY.th : COPY.en;
  const reduce = useReducedMotion();

  function proceed() {
    setMockRole("guest");
    router.push("/"); // return to the landing page to explore freely
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Backdrop: ambient brand wash + live 3D nexus spheres */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 18% 14%, rgba(243,146,0,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 82% 88%, rgba(45,156,255,0.14) 0%, transparent 60%)",
          }}
        />
        <GlobeBackdrop />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 56% at 50% 50%, transparent 32%, var(--background) 100%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-6 sm:px-6">
        <Logo />
        <Link
          href="/gateway"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground backdrop-blur transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2.5} aria-hidden />
          <span className={thai ? "font-thai" : ""}>{t.back}</span>
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-12 sm:px-6">
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl border border-border bg-card/70 p-7 shadow-2xl shadow-black/20 backdrop-blur-2xl dark:shadow-black/50 sm:p-9"
        >
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t.badge}
          </span>
          <h1 className={`mt-4 text-balance text-2xl font-bold leading-tight sm:text-3xl ${thai ? "font-thai" : "font-heading"}`}>
            {t.heading}
          </h1>
          <p className={`mt-2.5 text-sm leading-relaxed text-muted-foreground ${thai ? "font-thai" : ""}`}>
            {t.sub}
          </p>

          <div className="mt-7">
            <AuthButtons onLoggedIn={proceed} />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className={thai ? "font-thai" : ""}>{t.or}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={proceed}
            className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-muted ${thai ? "font-thai" : ""}`}
          >
            {t.continueGuest}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" strokeWidth={2.5} aria-hidden />
          </button>

          <p className={`mt-5 text-center text-[11px] leading-relaxed text-muted-foreground/80 ${thai ? "font-thai" : ""}`}>
            {t.note}
          </p>
        </motion.section>
      </div>
    </main>
  );
}
