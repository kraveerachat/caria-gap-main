/**
 * DrilldownRadar — reusable competency radar for the career drill-down view.
 *
 * Overlays the student's profile against the career's required profile across
 * Skills / Attitudes / Knowledge. Refined from the earlier GapRadarChart: the
 * pointer tilt is now gated on prefers-reduced-motion, and the data shape is
 * the shared RadarData type so any career's gap-analysis response drops in.
 */
"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLanguage } from "@/components/language-provider";
import type { RadarData, RadarSeries } from "@/types";

type DomainKey = "skills" | "attitudes" | "knowledge";

const TAB_LABELS: Record<DomainKey, { en: string; th: string }> = {
  skills: { en: "Skills", th: "ทักษะ" },
  attitudes: { en: "Attitudes", th: "ทัศนคติ" },
  knowledge: { en: "Knowledge", th: "ความรู้" },
};

const EMPTY_SERIES: RadarSeries = { labels: [], student_scores: [], career_scores: [] };

function CustomTooltip({ active, payload, accent }: { active?: boolean; payload?: any[]; accent: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 text-sm text-foreground shadow-xl backdrop-blur-md">
      <p className="mb-3 border-b border-border/60 pb-2 font-bold">{d.subject}</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span className="inline-block size-2.5 shrink-0 rounded-full bg-[#2563EB]" aria-hidden />
          <span className="font-medium text-muted-foreground">Career Required</span>
          <span className="ml-auto font-bold tabular-nums">{d.career}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-block size-2.5 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />
          <span className="font-medium text-muted-foreground">Your Profile</span>
          <span className="ml-auto font-bold tabular-nums">{d.student}</span>
        </div>
      </div>
    </div>
  );
}

export default function DrilldownRadar({
  radarData,
  accent = "#F39200",
}: {
  radarData: RadarData;
  accent?: string;
}) {
  const { lang } = useLanguage();
  const thai = lang === "th";
  const reduce = useReducedMotion();

  const [tab, setTab] = useState<DomainKey>("skills");
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const series = radarData[`drilldown_${tab}`] ?? EMPTY_SERIES;
  const chartData = series.labels.map((label, i) => ({
    subject: label.replace(/_/g, " "),
    student: series.student_scores[i] ?? 0,
    career: series.career_scores[i] ?? 0,
    fullMark: 100,
  }));

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 6, ry: px * 6 });
  };
  const reset = () => setTilt({ rx: 0, ry: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={reduce ? undefined : handleMove}
      onMouseLeave={reduce ? undefined : reset}
      animate={reduce ? undefined : { rotateX: tilt.rx, rotateY: tilt.ry }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      style={{ transformPerspective: 1000, transformStyle: "preserve-3d" }}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm dark:bg-card/30"
    >
      {/* Tabs + legend */}
      <div className="relative z-10 mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div
          role="tablist"
          aria-label={thai ? "เลือกหมวดสมรรถนะ" : "Select competency domain"}
          className="flex rounded-xl border border-border/80 bg-muted p-1 shadow-inner"
        >
          {(Object.keys(TAB_LABELS) as DomainKey[]).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                tab === key
                  ? "bg-primary font-bold text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {thai ? TAB_LABELS[key].th : TAB_LABELS[key].en}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-3.5 rounded-full bg-[#2563EB]" aria-hidden />
            <span className="text-muted-foreground">{thai ? "เป้าหมายอาชีพ" : "Career Required"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-3.5 rounded-full" style={{ background: accent }} aria-hidden />
            <span className="text-muted-foreground">{thai ? "สมรรถนะของคุณ" : "Your Profile"}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 h-[340px]">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {thai ? "ไม่มีข้อมูลในหมวดนี้" : "No data for this domain"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="var(--border)" strokeWidth={1} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--foreground)", fontSize: 11, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} stroke="var(--border)" tickCount={6} />
              <Radar name="Career Required" dataKey="career" stroke="#2563EB" strokeWidth={3} fill="transparent" dot={{ fill: "#2563EB", r: 3.5, strokeWidth: 1.5, stroke: "var(--card)" }} />
              <Radar name="Your Profile" dataKey="student" stroke={accent} strokeWidth={2} fill={accent} fillOpacity={0.2} dot={{ fill: accent, r: 3.5, strokeWidth: 0 }} />
              <Tooltip content={<CustomTooltip accent={accent} />} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
