/**
 * CariaReportSheet — the printable CARIA Competency Report.
 *
 * Rendered off-screen by the Fast-Track application flow and silently captured
 * to a PDF (html2canvas + jsPDF) that rides along with the student's transcript
 * into the SUT admissions pipeline. It is A4-proportioned (794×1123 at 96dpi)
 * and deliberately light/hex-only so the capture is deterministic regardless of
 * the dashboard's current theme — the capture additionally drops `.dark` from
 * the clone root so the embedded DrilldownRadar renders in light mode too.
 */
"use client";

import { forwardRef } from "react";
import DrilldownRadar from "@/components/dashboard/DrilldownRadar";
import { useLanguage } from "@/components/language-provider";
import type { CareerResult, RadarData } from "@/types";
import { getTrackForCareer, getTrackReadiness, getMes } from "@/lib/sut-tracks";
import { CAREER_THAI_NAMES } from "@/lib/career-translations";

const DOMAIN_LABELS: Record<string, { en: string; th: string }> = {
  Skills: { en: "Skills", th: "ทักษะ" },
  Attitudes: { en: "Attitudes", th: "ทัศนคติ" },
  Knowledge: { en: "Knowledge", th: "ความรู้" },
};

function DomainBar({
  label,
  student,
  career,
  accent,
}: {
  label: string;
  student: number;
  career: number;
  accent: string;
}) {
  const s = Math.max(0, Math.min(100, Math.round(student)));
  const c = Math.max(0, Math.min(100, Math.round(career)));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-slate-700">{label}</span>
        <span className="font-mono text-[12px] text-slate-500">
          <span className="font-bold text-slate-900">{s}</span>
          <span className="mx-1 text-slate-300">/</span>
          <span>{c}</span>
        </span>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-slate-100">
        {/* student fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${s}%`, background: accent }}
        />
        {/* career-required marker */}
        <div
          className="absolute inset-y-[-3px] w-[2px] rounded-full bg-[#002F6C]"
          style={{ left: `calc(${c}% - 1px)` }}
        />
      </div>
    </div>
  );
}

interface CariaReportSheetProps {
  career: CareerResult;
  radar: RadarData;
  userId: string;
  /** Optional ranked careers to list in the report (top matches). */
  careers?: CareerResult[];
}

const CariaReportSheet = forwardRef<HTMLDivElement, CariaReportSheetProps>(
  function CariaReportSheet({ career, radar, userId, careers }, ref) {
    const { lang } = useLanguage();
    const thai = lang === "th";

    const track = getTrackForCareer(career);
    const mes = getMes(career);
    const readiness = getTrackReadiness(mes);
    const accent = track.accent;

    const careerLabel = CAREER_THAI_NAMES[career.career_id] || career.career_name;
    const generatedOn = new Date().toLocaleDateString(thai ? "th-TH" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const summary = radar.summary_3axis;

    return (
      <div
        ref={ref}
        className="font-thai flex flex-col bg-white text-slate-900"
        style={{ width: 794, minHeight: 1123, padding: 48 }}
      >
        {/* Masthead */}
        <header className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-[#1a1100]"
              style={{ background: "#F39200" }}
            >
              CG
            </div>
            <div>
              <p className="font-syne text-xl font-extrabold tracking-tight text-slate-900">
                CARIA-GAP
              </p>
              <p className="text-[12px] font-medium text-slate-500">
                Competency Intelligence · Suranaree University of Technology
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em]"
              style={{ background: "#F3920018", color: "#a35f00" }}
            >
              {thai ? "รายงานสมรรถนะ" : "Competency Report"}
            </p>
            <p className="mt-2 font-mono text-[11px] text-slate-400">{generatedOn}</p>
          </div>
        </header>

        {/* Candidate + target */}
        <section className="mt-6 grid grid-cols-3 gap-4">
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {thai ? "ผู้สมัคร" : "Candidate"}
            </p>
            <p className="mt-1 font-syne text-2xl font-bold text-slate-900">{userId}</p>
            <div className="mt-4 flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold"
                style={{ background: `${accent}1a`, color: accent }}
              >
                {thai ? "สายหลักสูตร" : "SUT Track"}
              </span>
              <span className="text-[14px] font-semibold text-slate-700">
                {thai ? track.labelTh : track.labelEn}
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
              {thai ? "อาชีพเป้าหมายอันดับสูงสุด: " : "Top matched career: "}
              <span className="font-semibold text-slate-800">{careerLabel}</span>
            </p>
          </div>

          {/* MES dial */}
          <div
            className="flex flex-col items-center justify-center rounded-2xl border p-5 text-center"
            style={{ borderColor: `${readiness.color}40`, background: `${readiness.color}0d` }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              MES
            </p>
            <p
              className="font-syne text-5xl font-black leading-none"
              style={{ color: readiness.color }}
            >
              {mes}
            </p>
            <span
              className="mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{ background: `${readiness.color}1f`, color: readiness.color }}
            >
              {thai ? readiness.labelTh : readiness.labelEn}
            </span>
          </div>
        </section>

        {/* Radar — the captured DrilldownRadar */}
        <section className="mt-6">
          <h2 className="mb-3 font-syne text-base font-bold text-slate-900">
            {thai ? "การวิเคราะห์สมรรถนะเทียบอาชีพ" : "Competency vs. Career Profile"}
          </h2>
          <DrilldownRadar radarData={radar} accent={accent} />
        </section>

        {/* Top career matches */}
        {careers && careers.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 font-syne text-base font-bold text-slate-900">
              {thai ? "อาชีพที่ตรงกับคุณมากที่สุด" : "Top Career Matches"}
            </h2>
            <ol className="overflow-hidden rounded-2xl border border-slate-200">
              {careers.slice(0, 5).map((c, i) => (
                <li
                  key={c.career_id}
                  className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? "border-t border-slate-100" : ""}`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-[11px] font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800">
                    {CAREER_THAI_NAMES[c.career_id] || c.career_name}
                  </span>
                  <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums" style={{ color: accent }}>
                    {Math.round(c.match_percentage)}%
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Domain summary */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-syne text-base font-bold text-slate-900">
              {thai ? "สรุปรายหมวด" : "Domain Summary"}
            </h2>
            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-full" style={{ background: accent }} />
                {thai ? "สมรรถนะของคุณ" : "Your profile"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-[2px] rounded-full bg-[#002F6C]" />
                {thai ? "เกณฑ์อาชีพ" : "Career required"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 p-5">
            {summary.labels.map((label, i) => (
              <DomainBar
                key={label}
                label={
                  DOMAIN_LABELS[label]
                    ? thai
                      ? DOMAIN_LABELS[label].th
                      : DOMAIN_LABELS[label].en
                    : label
                }
                student={summary.student_averages[i] ?? 0}
                career={summary.career_averages[i] ?? 0}
                accent={accent}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 pt-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            {thai
              ? "เอกสารนี้สร้างโดยอัตโนมัติจากระบบ CARIA-GAP เพื่อประกอบการสมัคร Fast-Track เข้าหลักสูตร Digitech SUT · ข้อมูลสมรรถนะอ้างอิงจากแบบประเมินตนเองของผู้สมัคร"
              : "Auto-generated by CARIA-GAP for the Fast-Track application to the Digitech SUT program. Competency data is derived from the candidate's self-assessment."}
          </p>
        </footer>
      </div>
    );
  }
);

export default CariaReportSheet;
