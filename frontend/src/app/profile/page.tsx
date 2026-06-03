/**
 * Profile page — the student's saved assessment snapshot.
 *
 * Reads the latest result from localStorage (`caria_last_result`, persisted by
 * the dashboard), shows the matched SUT curriculum tracks, and lets the student
 * re-download their CARIA Competency Report (PDF) at any time. Application
 * submission lives on the dashboard, not here.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Gauge, GraduationCap, ArrowRight, UserRound, FileSearch } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CariaDownloadButton from "@/components/dashboard/CariaDownloadButton";
import { useCariaReport } from "@/hooks/use-caria-report";
import { useLanguage } from "@/components/language-provider";
import type { CareerResult, Top10Response } from "@/types";
import { getTrackForCareer, getTrackReadiness, getMes, type SutTrack } from "@/lib/sut-tracks";
import { CAREER_THAI_NAMES } from "@/lib/career-translations";

export default function ProfilePage() {
  const { lang } = useLanguage();
  const thai = lang === "th";

  const [result, setResult] = useState<Top10Response | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("caria_last_result");
      if (raw) setResult(JSON.parse(raw) as Top10Response);
    } catch {
      /* corrupt payload — treat as no result */
    } finally {
      setLoaded(true);
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

  const careerLabel = (c: CareerResult) => CAREER_THAI_NAMES[c.career_id] || c.career_name;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050A14] text-foreground font-thai relative overflow-hidden">
      <Navbar />

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-orange/10 blur-[130px] dark:bg-brand-orange/15" />
        <div className="absolute bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-[#002F6C]/10 blur-[110px] dark:bg-[#002F6C]/25" />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 border-b border-slate-200 pb-8 dark:border-white/10 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
            <UserRound className="size-7" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <h1 className="font-syne text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              {thai ? "โปรไฟล์ของฉัน" : "My Profile"}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              {thai
                ? "ผลประเมินสมรรถนะและสายหลักสูตรที่จับคู่กับคุณ"
                : "Your saved competency results and matched curriculum tracks."}
            </p>
          </div>
          {loaded && careers.length > 0 && (
            <div className="sm:ml-auto inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              <span>User: <strong className="font-bold text-slate-900 dark:text-white">{userId}</strong></span>
            </div>
          )}
        </div>

        {/* Loading */}
        {!loaded && (
          <div className="space-y-4" aria-hidden>
            <div className="h-40 animate-pulse rounded-3xl border border-border/60 bg-card/40" />
            <div className="h-64 animate-pulse rounded-3xl border border-border/60 bg-card/40" />
          </div>
        )}

        {/* Empty state */}
        {loaded && careers.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border/70 bg-card/30 px-6 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-slate-400 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-500">
              <FileSearch className="size-7" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
              {thai ? "ยังไม่มีผลประเมิน" : "No saved results yet"}
            </h2>
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

        {/* Result */}
        {loaded && careers.length > 0 && top && track && (
          <div className="space-y-8">
            {/* Summary + download */}
            <section className="rounded-3xl border border-border/70 bg-card/50 p-6 shadow-sm md:p-8 dark:bg-card/30">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {thai ? "อาชีพที่ตรงที่สุด" : "Top matched career"}
                  </p>
                  <h2 className="mt-1 font-syne text-2xl font-bold text-slate-900 dark:text-white">
                    {careerLabel(top)}
                  </h2>
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
            </section>

            {/* Matched tracks */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 font-syne text-lg font-bold text-slate-900 dark:text-white">
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
                      <p className="font-syne text-base font-bold text-slate-900 dark:text-white">
                        {thai ? t.labelTh : t.labelEn}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {cs.map((c) => (
                          <span
                            key={c.career_id}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                          >
                            {careerLabel(c)}
                            <span className="tabular-nums text-muted-foreground">{Math.round(c.match_percentage)}%</span>
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
            </section>
          </div>
        )}
      </main>

      <Footer />

      {/* Off-screen CARIA report for the download */}
      {sheet}
    </div>
  );
}
