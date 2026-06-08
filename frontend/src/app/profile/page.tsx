/**
 * Profile page — the signed-in account hub.
 *
 * State-aware: an SUT student sees a premium Student ID card (name, ID, program)
 * with sign-out; a guest sees a guest card with an optional account link. Below
 * the identity sits the saved assessment snapshot (matched tracks + CARIA report
 * download) and a Data & privacy section to delete local assessment history.
 *
 * All state is read from localStorage via `useMockAccount()`; no backend.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gauge,
  GraduationCap,
  ArrowRight,
  UserRound,
  FileSearch,
  CreditCard,
  LogOut,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import CariaDownloadButton from "@/components/dashboard/CariaDownloadButton";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { useCariaReport } from "@/hooks/use-caria-report";
import { useLanguage } from "@/components/language-provider";
import type { CareerResult, Top10Response } from "@/types";
import { getTrackForCareer, getTrackReadiness, getMes, type SutTrack } from "@/lib/sut-tracks";
import { CAREER_THAI_NAMES } from "@/lib/career-translations";
import { useMockAccount, clearMockIdentity, clearAssessmentHistory } from "@/lib/mock-auth";

const PROGRAM_LABELS: Record<string, { en: string; th: string }> = {
  DT: { en: "Digital Technology", th: "เทคโนโลยีดิจิทัล" },
};

export default function ProfilePage() {
  const { lang } = useLanguage();
  const thai = lang === "th";
  const router = useRouter();

  const account = useMockAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [result, setResult] = useState<Top10Response | null>(null);
  const [resultLoaded, setResultLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("caria_last_result");
      if (raw) setResult(JSON.parse(raw) as Top10Response);
    } catch {
      /* corrupt payload — treat as no result */
    } finally {
      setResultLoaded(true);
    }
  }, []);

  const careers = useMemo(() => result?.top10_careers ?? [], [result]);
  const userId = result?.user_id || "demo_ton";

  const { ready, capture, sheet } = useCariaReport(careers, userId);

  const top = careers[0];
  const track = top ? getTrackForCareer(top) : null;
  const mes = top ? getMes(top) : 0;
  const readiness = getTrackReadiness(mes);

  // Group the matched careers by the SUT track that owns them.
  const tracks = useMemo(() => {
    const map = new Map<string, { track: SutTrack; careers: CareerResult[] }>();
    for (const c of careers) {
      const t = getTrackForCareer(c);
      if (!map.has(t.id)) map.set(t.id, { track: t, careers: [] });
      map.get(t.id)!.careers.push(c);
    }
    return [...map.values()].sort((a, b) => b.careers.length - a.careers.length);
  }, [careers]);

  const careerLabel = (c: CareerResult) =>
    thai ? CAREER_THAI_NAMES[c.career_id] || c.career_name : c.career_name;

  const handleSignOut = () => {
    clearMockIdentity();
    router.push("/");
  };

  const handleClearHistory = () => {
    const ask = thai
      ? "ต้องการลบประวัติการประเมินทั้งหมดหรือไม่? การกระทำนี้ย้อนกลับไม่ได้"
      : "Delete all assessment history? This cannot be undone.";
    if (window.confirm(ask)) {
      clearAssessmentHistory();
      setResult(null);
      window.alert(thai ? "ลบประวัติการประเมินเรียบร้อยแล้ว" : "Assessment history deleted.");
    }
  };

  const studentName = account.student?.name?.trim();
  const studentInitial = studentName?.[0]?.toUpperCase();
  const programKey = account.student?.program?.trim().toUpperCase() ?? "";
  const programLabel = PROGRAM_LABELS[programKey]
    ? `${thai ? PROGRAM_LABELS[programKey].th : PROGRAM_LABELS[programKey].en} (${programKey})`
    : account.student?.program || "—";
  const guestName = account.guestUser?.name?.trim() || null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-foreground font-thai dark:bg-[#050A14]">
      <SiteHeader />

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-orange/10 blur-[130px] dark:bg-brand-orange/15" />
        <div className="absolute bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-[#002F6C]/10 blur-[110px] dark:bg-[#002F6C]/25" />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-20">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance text-slate-900 dark:text-white md:text-4xl">
            {thai ? "โปรไฟล์ของฉัน" : "My Profile"}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            {thai
              ? "บัญชีของคุณ ผลการประเมินที่บันทึกไว้ และการจัดการข้อมูล"
              : "Your account, saved assessment results, and data controls."}
          </p>
        </header>

        <div className="space-y-8">
          {/* ---- Identity ----------------------------------------------- */}
          {!mounted ? (
            <div className="h-52 animate-pulse rounded-3xl border border-border/60 bg-card/40" aria-hidden />
          ) : account.isStudent ? (
            /* State A — premium SUT Student ID card (white in light, deep navy-ink in dark) */
            <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 transition-all dark:border-white/10 dark:bg-[#0B0F19] dark:shadow-black/40">
              {/* Delicate Accent Line */}
              <div aria-hidden className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-80" />

              {/* Watermark Texture */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] mix-blend-overlay dark:opacity-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sut-caria-logo.png" alt="" className="size-80 object-contain blur-[1px]" />
              </div>

              <div className="relative p-6 sm:p-8">
                {/* Header: SUT mark + card label, live status */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/sut-caria-logo.png"
                      alt="SUT-CARIA"
                      className="size-8 shrink-0 object-contain drop-shadow-sm"
                    />
                    <div className="leading-tight">
                      <p className="font-heading text-[13px] font-bold uppercase tracking-widest text-slate-800 dark:text-white">
                        DIGITECH SUT
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {thai ? "บัตรประจำตัวนักศึกษา" : "Student ID Card"}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-500/20 backdrop-blur-md dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20">
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden />
                    {thai ? "ใช้งานอยู่" : "Active"}
                  </span>
                </div>

                {/* Photo slot + icon-labelled fields */}
                <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10">
                  {/* Profile picture placeholder with sophisticated ring accent */}
                  <div className="relative flex size-28 shrink-0 items-center justify-center self-start rounded-full bg-gradient-to-br from-slate-50 to-slate-100 text-4xl font-bold text-slate-400 shadow-inner dark:from-white/5 dark:to-transparent dark:text-slate-500 sm:self-center">
                    <div className="absolute inset-0 rounded-full ring-1 ring-brand-orange/20 dark:ring-brand-orange/30" />
                    <div className="absolute -inset-2 rounded-full ring-1 ring-dashed ring-slate-200 dark:ring-white/10" />
                    {studentInitial ?? <UserRound className="size-12" strokeWidth={1.5} aria-hidden />}
                  </div>

                  <div className="min-w-0 flex-1 space-y-5">
                    {/* Name */}
                    <div className="group flex items-center gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-brand-orange shadow-sm transition-transform group-hover:scale-105 dark:border-white/5 dark:bg-white/5 dark:text-brand-orange/80">
                        <UserRound className="size-[18px]" strokeWidth={2} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          {thai ? "ชื่อ-นามสกุล" : "Name"}
                        </p>
                        <p className="mt-0.5 max-w-[200px] truncate text-base font-extrabold text-slate-800 dark:text-white">
                          {studentName || (thai ? "นักศึกษา SUT" : "SUT Student")}
                        </p>
                      </div>
                    </div>

                    {/* Student ID */}
                    <div className="group flex items-center gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-[#2D9CFF] shadow-sm transition-transform group-hover:scale-105 dark:border-white/5 dark:bg-white/5 dark:text-[#2D9CFF]/80">
                        <CreditCard className="size-[18px]" strokeWidth={2} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          {thai ? "รหัสนักศึกษา" : "Student ID"}
                        </p>
                        <p className="mt-0.5 max-w-[200px] truncate font-mono text-base font-bold tracking-wider text-slate-800 tabular-nums dark:text-white">
                          {account.student?.student_id ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* Program */}
                    <div className="group flex items-center gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-emerald-500 shadow-sm transition-transform group-hover:scale-105 dark:border-white/5 dark:bg-white/5 dark:text-emerald-500/80">
                        <GraduationCap className="size-[18px]" strokeWidth={2} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          {thai ? "หลักสูตร" : "Program"}
                        </p>
                        <p className="mt-0.5 max-w-[200px] truncate text-sm font-bold text-slate-800 dark:text-white">
                          {programLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: provenance + sign out */}
              <div className="relative flex flex-col gap-3 border-t border-slate-100/50 bg-slate-50/50 px-6 py-4 dark:border-white/5 dark:bg-white/[0.01] sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {thai ? "เข้าสู่ระบบด้วยรหัสนักศึกษา SUT" : "Signed in with your SUT Student ID"}
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2 text-[13px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-danger dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-danger"
                >
                  <LogOut className="size-3.5" strokeWidth={2.5} aria-hidden />
                  {thai ? "ออกจากระบบ" : "Sign out"}
                </button>
              </div>
            </section>
          ) : account.loggedIn ? (
            /* State B — guest profile */
            <section className="rounded-3xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-sm dark:bg-card/30 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/12 text-brand-orange ring-1 ring-inset ring-brand-orange/25">
                  <UserRound className="size-8" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                    {thai ? "ใช้งานอยู่" : "Active"}
                  </span>
                  <h2 className="mt-2 truncate font-heading text-2xl font-bold text-slate-900 dark:text-white">
                    {guestName || (thai ? "ผู้เยี่ยมชม" : "Guest User")}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {thai
                      ? "กำลังใช้งานแบบผู้เยี่ยมชม ผลลัพธ์ถูกเก็บไว้บนเครื่องนี้"
                      : "Browsing as a guest. Your results are saved on this device."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-muted hover:text-foreground dark:text-slate-300 sm:self-center"
                >
                  <LogOut className="size-4" aria-hidden />
                  {thai ? "ออกจากระบบ" : "Sign out"}
                </button>
              </div>

              {account.guestUser ? (
                <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/60 pt-5 text-sm text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="size-4 text-emerald-500" aria-hidden />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {thai ? `เชื่อมต่อผ่าน ${account.guestUser.provider}` : `Linked via ${account.guestUser.provider}`}
                  </span>
                  <span>· {account.guestUser.email}</span>
                </p>
              ) : (
                <div className="mt-6 border-t border-border/60 pt-5">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {thai ? "เชื่อมต่อบัญชีเพื่อบันทึกข้ามอุปกรณ์" : "Link an account to save across devices"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {thai ? "เดโม: การเชื่อมต่อเป็นการจำลอง ยังไม่เชื่อมต่อ OAuth จริง" : "Demo: linking is mocked, no real OAuth is connected."}
                  </p>
                  <div className="mt-4 max-w-sm">
                    <AuthButtons />
                  </div>
                </div>
              )}
            </section>
          ) : (
            /* Signed out (avatar normally hides, but guard the direct route) */
            <section className="flex flex-col items-center rounded-3xl border border-dashed border-border/70 bg-card/30 px-6 py-14 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                <ShieldCheck className="size-7" strokeWidth={1.75} aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
                {thai ? "ยังไม่ได้เข้าสู่ระบบ" : "You're not signed in"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {thai
                  ? "เข้าสู่ระบบเพื่อบันทึกผลการประเมินและดูโปรไฟล์ของคุณ"
                  : "Sign in to save your assessment results and view your profile."}
              </p>
              <Link
                href="/gateway"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-brand-orange-foreground shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {thai ? "เข้าสู่ระบบ" : "Sign in"}
                <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </section>
          )}

          {/* ---- Assessment snapshot ----------------------------------- */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-slate-900 dark:text-white">
              <Gauge className="size-5 text-brand-orange" strokeWidth={2.25} aria-hidden />
              {thai ? "ผลการประเมินของคุณ" : "Your assessment"}
            </h2>

            {!resultLoaded && (
              <div className="space-y-4" aria-hidden>
                <div className="h-32 animate-pulse rounded-3xl border border-border/60 bg-card/40" />
                <div className="h-56 animate-pulse rounded-3xl border border-border/60 bg-card/40" />
              </div>
            )}

            {resultLoaded && careers.length === 0 && (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-border/70 bg-card/30 px-6 py-14 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-slate-400 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-500">
                  <FileSearch className="size-7" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
                  {thai ? "ยังไม่มีผลประเมิน" : "No saved results yet"}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {thai
                    ? "ทำแบบประเมินสมรรถนะเพื่อดูอาชีพและสายหลักสูตรที่เหมาะกับคุณ แล้วผลลัพธ์จะถูกบันทึกไว้ที่นี่"
                    : "Take the competency assessment to see your matched careers and tracks. Your results will be saved here."}
                </p>
                <Link
                  href="/assessment"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-brand-orange-foreground shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {thai ? "เริ่มทำแบบประเมิน" : "Start assessment"}
                  <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
                </Link>
              </div>
            )}

            {resultLoaded && careers.length > 0 && top && track && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border/70 bg-card/50 p-6 shadow-sm dark:bg-card/30 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {thai ? "อาชีพที่ตรงที่สุด" : "Top matched career"}
                      </p>
                      <h3 className="mt-1 font-heading text-2xl font-bold text-slate-900 dark:text-white">
                        {careerLabel(top)}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={{ background: `${track.accent}1a`, color: track.accent }}
                        >
                          <track.Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
                          {thai ? track.labelTh : track.labelEn}
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={{ background: `${readiness.color}1f`, color: readiness.color }}
                        >
                          <Gauge className="size-3.5" strokeWidth={2.5} aria-hidden />
                          {mes} MES · {thai ? readiness.labelTh : readiness.labelEn}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <CariaDownloadButton
                        capture={capture}
                        ready={ready}
                        userId={userId}
                        variant="primary"
                        className="w-full md:w-auto"
                      />
                      <p className="mt-2 text-center text-[11px] text-muted-foreground md:text-right">
                        {thai ? "ดาวน์โหลดได้ทุกเมื่อ" : "Download anytime"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-slate-900 dark:text-white">
                    <GraduationCap className="size-5 text-brand-orange" strokeWidth={2.25} aria-hidden />
                    {thai ? "สายหลักสูตรที่จับคู่กับคุณ" : "Your matched tracks"}
                  </h3>
                  <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card/40 dark:bg-white/2">
                    {tracks.map(({ track: t, careers: cs }) => (
                      <li key={t.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                        <span
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `${t.accent}1a`, color: t.accent }}
                        >
                          <t.Icon className="size-5" strokeWidth={2.25} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-base font-bold text-slate-900 dark:text-white">
                            {thai ? t.labelTh : t.labelEn}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {cs.map((c) => (
                              <span
                                key={c.career_id}
                                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                              >
                                {careerLabel(c)}
                                <span className="tabular-nums text-muted-foreground">
                                  {Math.round(c.match_percentage)}%
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="shrink-0 self-start rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground sm:self-center">
                          {cs.length} {thai ? "อาชีพ" : cs.length === 1 ? "career" : "careers"}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Link
                      href={`/dashboard?user=${userId}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange transition-colors hover:text-brand-orange/80"
                    >
                      {thai ? "กลับไปหน้าผลประเมินและยื่นสมัคร" : "Back to results & apply"}
                      <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ---- Data & privacy ---------------------------------------- */}
          {mounted && account.loggedIn && (
            <section className="rounded-3xl border border-border/70 bg-card/40 p-6 dark:bg-card/30">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {thai ? "ข้อมูลและความเป็นส่วนตัว" : "Data & privacy"}
              </h2>
              <p className="mt-1 max-w-prose text-sm text-slate-500 dark:text-slate-400">
                {thai
                  ? "ประวัติการประเมินถูกเก็บไว้บนเครื่องของคุณ (PDPA-friendly) ลบทิ้งได้ทุกเมื่อ"
                  : "Your assessment history is stored on this device (PDPA-friendly). Delete it anytime."}
              </p>
              <button
                type="button"
                onClick={handleClearHistory}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/20"
              >
                <Trash2 className="size-4" aria-hidden />
                {thai ? "ลบประวัติการประเมิน" : "Delete assessment history"}
              </button>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />

      {/* Off-screen CARIA report for the download */}
      {sheet}
    </div>
  );
}
