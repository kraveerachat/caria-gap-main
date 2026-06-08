"use client";

/**
 * SUT student sign-in (route "/signin-student"), reached from the gateway's
 * student branch. DEMO MOCK: there is no backend or database lookup. A Student
 * ID that matches the SUT format (a "B" followed by 7 digits, e.g. B6703370) is
 * accepted, saved to localStorage, and sent straight into the assessment.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, GraduationCap, AlertCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";
import { setMockRole } from "@/hooks/useMockAuth";
import { GlobeBackdrop } from "@/components/GlobeBackdrop";

// SUT Student ID: a "B"/"b" followed by exactly 7 digits (e.g. B6703370).
const STUDENT_ID_PATTERN = /^[Bb]\d{7}$/;

const COPY = {
  th: {
    back: "ย้อนกลับ",
    badge: "นักศึกษา DIGITECH SUT",
    heading: "เข้าสู่ระบบด้วยรหัสนักศึกษา",
    sub: "กรอกรหัสนักศึกษาของคุณเพื่อเข้าสู่ระบบและบันทึกผลการประเมินของคุณ",
    idLabel: "รหัสนักศึกษา",
    idPlaceholder: "เช่น B6703370",
    nameLabel: "ชื่อ (ไม่บังคับ)",
    namePlaceholder: "ชื่อ-นามสกุล",
    submit: "เข้าสู่ระบบ",
    error: "รูปแบบรหัสนักศึกษาไม่ถูกต้อง ใช้ตัวอักษร B ตามด้วยตัวเลข 7 หลัก (เช่น B6703370)",
    note: "เดโม: ตรวจสอบเฉพาะรูปแบบรหัส ไม่เชื่อมต่อฐานข้อมูลจริง",
  },
  en: {
    back: "Back",
    badge: "DIGITECH SUT Student",
    heading: "Sign in with your Student ID",
    sub: "Enter your Student ID to sign in and save your assessment results.",
    idLabel: "Student ID",
    idPlaceholder: "e.g. B6703370",
    nameLabel: "Name (optional)",
    namePlaceholder: "Full name",
    submit: "Sign in",
    error: "Invalid Student ID format. Use a B followed by 7 digits (e.g. B6703370).",
    note: "Demo: only the ID format is checked, no real database is connected.",
  },
} as const;

export default function StudentSignInPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const thai = lang === "th";
  const t = thai ? COPY.th : COPY.en;
  const reduce = useReducedMotion();

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = studentId.trim().toUpperCase();
    if (!STUDENT_ID_PATTERN.test(id)) {
      setError(true);
      return;
    }
    setError(false);
    setMockRole("student");
    try {
      localStorage.setItem(
        "sut_caria_student",
        JSON.stringify({ student_id: id, name: name.trim() || undefined, program: "DT", ts: Date.now() }),
      );
    } catch {
      /* storage unavailable — proceed anyway */
    }
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-orange">
            <GraduationCap className="size-3.5" strokeWidth={2.5} aria-hidden />
            <span className={thai ? "font-thai" : ""}>{t.badge}</span>
          </span>
          <h1 className={`mt-4 text-balance text-2xl font-bold leading-tight sm:text-3xl ${thai ? "font-thai" : "font-heading"}`}>
            {t.heading}
          </h1>
          <p className={`mt-2.5 text-sm leading-relaxed text-muted-foreground ${thai ? "font-thai" : ""}`}>
            {t.sub}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="student_id" className={`text-xs font-bold text-foreground ${thai ? "font-thai" : ""}`}>
                {t.idLabel}
              </label>
              <input
                id="student_id"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (error) setError(false);
                }}
                placeholder={t.idPlaceholder}
                autoComplete="username"
                aria-invalid={error}
                className={`w-full rounded-xl border bg-background px-4 py-3 text-sm font-mono uppercase tracking-wider text-foreground outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:ring-2 ${
                  error ? "border-red-500 focus-visible:ring-red-500/40" : "border-border focus-visible:border-brand-orange focus-visible:ring-brand-orange/30"
                }`}
              />
              {error && (
                <p role="alert" className={`mt-0.5 flex items-start gap-1.5 text-xs font-medium text-red-500 ${thai ? "font-thai" : ""}`}>
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                  {t.error}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="student_name" className={`text-xs font-bold text-foreground ${thai ? "font-thai" : ""}`}>
                {t.nameLabel}
              </label>
              <input
                id="student_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                autoComplete="name"
                className={`w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange/30 ${thai ? "font-thai" : ""}`}
              />
            </div>

            <button
              type="submit"
              className={`group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 py-3.5 text-sm font-bold text-brand-orange-foreground shadow-md shadow-brand-orange/20 transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98] ${thai ? "font-thai" : ""}`}
            >
              {t.submit}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" strokeWidth={2.5} aria-hidden />
            </button>
          </form>

          <p className={`mt-5 text-center text-[11px] leading-relaxed text-muted-foreground/80 ${thai ? "font-thai" : ""}`}>
            {t.note}
          </p>
        </motion.section>
      </div>
    </main>
  );
}
