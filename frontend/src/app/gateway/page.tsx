"use client";

/**
 * Assessment funnel gateway (route "/gateway").
 *
 * Reached from the "Start Assessment" CTAs. Unlike the first-touch entry at "/",
 * this screen always shows the segment picker (it is the funnel step) and BRANCHES
 * by segment so the B2C/B2B lead funnel is preserved:
 *   - SUT Student  -> the existing Student-ID form (/signin)
 *   - Guest        -> the Google/Facebook sign-in mockup (/gateway/guest)
 *
 * The segment is persisted to localStorage (sut_caria_role) so RouteGuard lets
 * the visitor into /assessment afterward. Pure frontend mock, no backend.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, UserRound, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";
import { GlobeBackdrop } from "@/components/GlobeBackdrop";

type Role = "student" | "guest";

const COPY = {
  th: {
    back: "กลับหน้าหลัก",
    badge: "เข้าสู่ระบบ",
    heading: "เข้าสู่ระบบ CARIA-GAP",
    sub: "เลือกประเภทผู้ใช้เพื่อเข้าสู่ระบบ จากนั้นกลับมาสำรวจหน้าหลักต่อได้เลย",
    studentTitle: "นักศึกษา",
    studentDesc: "เข้าสู่ระบบด้วยรหัสนักศึกษา เพื่อบันทึกผลและปลดล็อกหลักสูตรของ มทส.",
    studentBadge: "นักศึกษาคณะ DIGITECH SUT",
    guestTitle: "บุคคลทั่วไป",
    guestDesc: "เข้าสู่ระบบด้วย Google หรือ Facebook เพื่อเก็บผลการประเมินของคุณ",
    pdpa: "ข้อมูลของคุณใช้เพื่อประมวลผลการจับคู่อาชีพเท่านั้น",
  },
  en: {
    back: "Back to home",
    badge: "Sign in",
    heading: "Sign in to CARIA-GAP",
    sub: "Choose how you'd like to sign in, then head back to explore.",
    studentTitle: "Student",
    studentDesc: "Sign in with your Student ID to save results and unlock SUT courses.",
    studentBadge: "DIGITECH SUT student",
    guestTitle: "Guest",
    guestDesc: "Sign in with Google or Facebook to keep your assessment results.",
    pdpa: "Your data is used only to run the career-matching engine.",
  },
} as const;

export default function GatewayPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const thai = lang === "th";
  const t = thai ? COPY.th : COPY.en;
  const reduce = useReducedMotion();

  const [pending, setPending] = useState<Role | null>(null);

  function choose(role: Role) {
    if (pending) return;
    setPending(role);
    // The actual login (and role) is recorded on the sign-in page itself.
    router.push(role === "student" ? "/signin-student" : "/signin-guest");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Backdrop: ambient brand wash + live 3D nexus spheres */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 16% 14%, rgba(243,146,0,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 84% 88%, rgba(45,156,255,0.14) 0%, transparent 60%)",
          }}
        />
        <GlobeBackdrop />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 64% 58% at 50% 50%, transparent 30%, var(--background) 100%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-6 sm:px-6">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground backdrop-blur transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2.5} aria-hidden />
          <span className={thai ? "font-thai" : ""}>{t.back}</span>
        </Link>
      </div>

      {/* Picker */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-5 py-12 sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-orange">
            {t.badge}
          </span>
          <h1 className={`mx-auto mt-4 max-w-2xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl ${thai ? "font-thai" : "font-syne"}`}>
            {t.heading}
          </h1>
          <p className={`mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base ${thai ? "font-thai" : ""}`}>
            {t.sub}
          </p>

          {/* Choices: student (primary) + guest (neutral) */}
          <div className="mt-9 grid gap-4 text-left sm:grid-cols-2">
            {/* SUT student */}
            <button
              type="button"
              onClick={() => choose("student")}
              disabled={pending !== null}
              aria-busy={pending === "student"}
              className="group relative flex flex-col rounded-3xl border border-brand-orange/40 bg-brand-orange/[0.06] p-6 outline-none transition-all duration-200 hover:-translate-y-1 hover:border-brand-orange/70 hover:shadow-[0_20px_50px_-16px_rgba(243,146,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:hover:translate-y-0"
            >
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-orange">
                <ShieldCheck className="size-3" strokeWidth={2.5} aria-hidden />
                <span className={thai ? "font-thai" : ""}>{t.studentBadge}</span>
              </span>
              <span
                className="flex size-12 items-center justify-center rounded-2xl text-[#0a1224] shadow-md"
                style={{ backgroundImage: "linear-gradient(118deg, #F39200 0%, #FF8A00 45%, #2D9CFF 105%)" }}
              >
                {pending === "student" ? (
                  <Loader2 className="size-6 animate-spin" strokeWidth={2.5} aria-hidden />
                ) : (
                  <GraduationCap className="size-6" strokeWidth={2.25} aria-hidden />
                )}
              </span>
              <h2 className={`mt-4 text-lg font-bold text-foreground ${thai ? "font-thai" : ""}`}>{t.studentTitle}</h2>
              <p className={`mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground ${thai ? "font-thai" : ""}`}>
                {t.studentDesc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-orange">
                {thai ? "เลือกเส้นทางนี้" : "Choose this path"}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" strokeWidth={2.5} aria-hidden />
              </span>
            </button>

            {/* Guest */}
            <button
              type="button"
              onClick={() => choose("guest")}
              disabled={pending !== null}
              aria-busy={pending === "guest"}
              className="group relative flex flex-col rounded-3xl border border-border bg-card/60 p-6 backdrop-blur outline-none transition-all duration-200 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:hover:translate-y-0"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-muted text-foreground">
                {pending === "guest" ? (
                  <Loader2 className="size-6 animate-spin" strokeWidth={2.5} aria-hidden />
                ) : (
                  <UserRound className="size-6" strokeWidth={2.25} aria-hidden />
                )}
              </span>
              <h2 className={`mt-4 text-lg font-bold text-foreground ${thai ? "font-thai" : ""}`}>{t.guestTitle}</h2>
              <p className={`mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground ${thai ? "font-thai" : ""}`}>
                {t.guestDesc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                {thai ? "เลือกเส้นทางนี้" : "Choose this path"}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" strokeWidth={2.5} aria-hidden />
              </span>
            </button>
          </div>

          <p className={`mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground ${thai ? "font-thai" : ""}`}>
            <ShieldCheck className="size-3.5 text-brand-orange" strokeWidth={2.25} aria-hidden />
            {t.pdpa}
          </p>
        </motion.div>
      </div>
    </main>
  );
}
