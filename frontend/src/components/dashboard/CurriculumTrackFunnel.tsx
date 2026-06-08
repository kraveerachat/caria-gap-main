/**
 * CurriculumTrackFunnel — the career drill-down (Screen 2) that routes a
 * matched student toward the SUT program owning their path.
 *
 * For a selected recommended career it shows: the competency DrilldownRadar,
 * a Track Readiness Badge derived from the MES score, faculty-level upskill
 * programs that close the remaining gap, and a single conversion CTA into the
 * SUT track. High-level tracks and programs only, no individual course codes.
 */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Gauge, Clock, Layers } from "lucide-react";
import DrilldownRadar from "@/components/dashboard/DrilldownRadar";
import { useLanguage } from "@/components/language-provider";
import { buildRadarData, demoStudentScores } from "@/lib/gap-analysis";
import { MOCK_GAP_ANALYSIS } from "@/lib/mockData";
import type { CareerResult, CompetencyScores, RadarData } from "@/types";
import { getTrackForCareer, getTrackReadiness, getMes, readableOn } from "@/lib/sut-tracks";

export default function CurriculumTrackFunnel({
  careers,
  userId,
  scores,
}: {
  careers: CareerResult[];
  userId: string;
  /** Resolved competency scores from the dashboard; falls back to localStorage / demo. */
  scores?: CompetencyScores | null;
}) {
  const { lang } = useLanguage();
  const thai = lang === "th";

  const options = careers.slice(0, 5);
  const [selectedId, setSelectedId] = useState(options[0]?.career_id ?? "");
  const selected = options.find((c) => c.career_id === selectedId) ?? options[0];

  // Resolve the student's scores without any backend or next-auth: prefer the
  // value passed from the dashboard, then localStorage (parsed defensively),
  // then the deterministic demo profile so there is always real input.
  const resolvedScores = useMemo<CompetencyScores>(() => {
    if (scores && Object.keys(scores).length > 0) return scores;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("user_custom_scores");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed as CompetencyScores;
          }
        }
      } catch {
        /* malformed JSON — fall through to the demo profile */
      }
    }
    return demoStudentScores();
  }, [scores]);

  // Radar is built synchronously client-side via the MES engine. It renders
  // immediately and can never hang: any failure falls back to bundled mock data.
  const radar = useMemo<RadarData>(() => {
    try {
      const built = buildRadarData(resolvedScores, selected?.career_id ?? "", thai);
      const hasData =
        built.drilldown_skills.labels.length > 0 ||
        built.drilldown_attitudes.labels.length > 0 ||
        built.drilldown_knowledge.labels.length > 0;
      return hasData ? built : MOCK_GAP_ANALYSIS.radar_data;
    } catch (err) {
      console.warn("Radar computation failed; using mock data", err);
      return MOCK_GAP_ANALYSIS.radar_data;
    }
  }, [resolvedScores, selected?.career_id, thai]);

  if (!selected) return null;

  const track = getTrackForCareer(selected);
  const mes = getMes(selected);
  const readiness = getTrackReadiness(mes);
  const TrackIcon = track.Icon;

  return (
    <section className="mt-16 border-t border-slate-200 pt-12 dark:border-white/10">
      {/* Section heading — funnel framing */}
      <div className="mb-8 max-w-3xl">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color: track.accent, borderColor: `${track.accent}40`, background: `${track.accent}14` }}
        >
          <GraduationCap className="size-3.5" strokeWidth={2.5} aria-hidden />
          {thai ? "เส้นทางหลักสูตร มทส." : "SUT Curriculum Track"}
        </div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {thai ? "แต่ละอาชีพเชื่อมตรงสู่หลักสูตรของ มทส." : "Each career maps to an SUT program"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {thai
            ? "เลือกอาชีพเพื่อดูความพร้อม (Track Readiness) จากคะแนน MES และโปรแกรมพัฒนาทักษะของคณะที่จะพาคุณไปถึงเป้าหมาย"
            : "Pick a career to see your Track Readiness from the MES score, and the faculty programs that take you the rest of the way."}
        </p>
      </div>

      {/* Career selector */}
      <div className="mb-8 flex flex-wrap gap-2.5" role="tablist" aria-label={thai ? "เลือกอาชีพ" : "Select a career"}>
        {options.map((c) => {
          const t = getTrackForCareer(c);
          const Icon = t.Icon;
          const isActive = c.career_id === selected.career_id;
          return (
            <button
              key={c.career_id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedId(c.career_id)}
              className={`group flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "border-transparent bg-white shadow-md dark:bg-slate-900/80"
                  : "border-slate-200 bg-white/50 hover:border-slate-300 dark:border-white/10 dark:bg-white/2 dark:hover:border-white/20"
              }`}
              style={isActive ? { boxShadow: `0 0 0 1.5px ${t.accent}, 0 10px 30px -12px ${t.accent}66` } : undefined}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${t.accent}1a`, color: t.accent }}
              >
                <Icon className="size-4" strokeWidth={2.25} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{c.career_name}</span>
                <span className="block text-[11px] font-medium text-muted-foreground">
                  {thai ? "ความเข้ากันได้" : "Match"} <span className="tabular-nums">{Math.round(c.match_percentage)}%</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail: radar + readiness/programs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Radar */}
        <div className="lg:col-span-3">
          <DrilldownRadar radarData={radar} accent={track.accent} />
        </div>

        {/* Readiness + programs + CTA */}
        <div className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm dark:bg-card/30">
            {/* Track tag */}
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl" style={{ background: `${track.accent}1a`, color: track.accent }}>
                <TrackIcon className="size-4" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{thai ? "สายหลักสูตร มทส." : "SUT Track"}</p>
                <p className="truncate font-heading text-base font-bold text-slate-900 dark:text-white">
                  {thai ? track.labelTh : track.labelEn}
                </p>
              </div>
            </div>

            {/* Track Readiness Badge (MES) */}
            <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: `${readiness.color}33`, background: `${readiness.color}0f` }}>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${readiness.color}1f`, color: readiness.color }}>
                  <Gauge className="size-3.5" strokeWidth={2.5} aria-hidden />
                  {thai ? readiness.labelTh : readiness.labelEn}
                </span>
                <div className="text-right">
                  <span className="font-heading text-2xl font-extrabold tabular-nums leading-none" style={{ color: readiness.color }}>
                    {mes}
                  </span>
                  <span className="ml-0.5 text-xs font-bold text-muted-foreground">MES</span>
                </div>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {thai ? readiness.blurbTh : readiness.blurbEn}
              </p>
            </div>

            {/* Faculty upskill programs */}
            <div className="mt-5 flex-1">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Layers className="size-3.5 text-muted-foreground" strokeWidth={2.5} aria-hidden />
                {thai ? "โปรแกรมพัฒนาทักษะของคณะ" : "Faculty upskill programs"}
              </p>
              <ul className="flex flex-col gap-2.5">
                {track.programs.map((p) => (
                  <li
                    key={p.nameEn}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {thai ? p.nameTh : p.nameEn}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" strokeWidth={2.25} aria-hidden />
                        <span className="tabular-nums">{p.weeks}</span> {thai ? "สัปดาห์" : "weeks"}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `${track.accent}1a`, color: track.accent }}
                    >
                      {p.format}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Funnel CTA */}
            <Link
              href={`/career/${selected.career_id}?user=${userId}`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold shadow-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              style={{ background: track.accent, color: readableOn(track.accent) }}
            >
              {thai ? `ดูเส้นทางหลักสูตร ${track.labelTh}` : `Explore the SUT ${track.labelEn} program`}
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
