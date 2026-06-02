"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
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

interface GapRadarChartProps {
  radarData: {
    drilldown_skills: { labels: string[]; student_scores: number[]; career_scores: number[] };
    drilldown_attitudes: { labels: string[]; student_scores: number[]; career_scores: number[] };
    drilldown_knowledge: { labels: string[]; student_scores: number[]; career_scores: number[] };
  };
}

interface PriorityGapsListProps {
  gaps: Array<{
    competency_id: string;
    domain: string;
    student_score: number;
    career_required: number;
    gap_score: number;
  }>;
}

const priorityColors: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F39200",
  Medium: "#3B82F6",
};

// Custom tooltip for radar
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl p-4 text-sm shadow-xl bg-card border border-border/80 backdrop-blur-md text-foreground">
        <p className="font-bold mb-3 border-b border-border/60 pb-2">{data.subject}</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-block size-2.5 shrink-0 rounded-full bg-[#002F6C] shadow-[0_0_6px_rgba(0,47,108,0.6)]" aria-hidden />
            <span className="font-medium text-slate-500 dark:text-slate-400">Career Required:</span>
            <span className="ml-auto font-bold text-slate-900 dark:text-white">{data.career}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-block size-2.5 shrink-0 rounded-full bg-brand-orange shadow-[0_0_6px_rgba(243,146,0,0.7)]" aria-hidden />
            <span className="font-medium text-slate-500 dark:text-slate-400">Your Profile:</span>
            <span className="ml-auto font-bold text-slate-900 dark:text-white">{data.student}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/* ------------------------------------------------------------------ */
/*  1. GapRadarChart Component                                        */
/* ------------------------------------------------------------------ */
export default function GapRadarChart({ radarData }: GapRadarChartProps) {
  const [activeTab, setActiveTab] = useState<"skills" | "attitudes" | "knowledge">("skills");
  const { lang } = useLanguage();
  const thai = lang === "th";

  const chartData = (radarData[`drilldown_${activeTab}`] || { labels: [], student_scores: [], career_scores: [] }).labels.map((label, i) => ({
    subject: label.replace(/_/g, " "),
    student: radarData[`drilldown_${activeTab}`]?.student_scores[i] ?? 0,
    career: radarData[`drilldown_${activeTab}`]?.career_scores[i] ?? 0,
    fullMark: 100,
  }));

  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [glow, setGlow] = useState({ x: 0, y: 0, active: false });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Max tilt angle 8 degrees (subtle, elegant)
    const rotateX = -(mouseY / (height / 2)) * 8;
    const rotateY = (mouseX / (width / 2)) * 8;
    
    setTiltX(rotateX);
    setTiltY(rotateY);
    setGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };

  const handleMouseLeave = () => {
    setTiltX(0);
    setTiltY(0);
    setGlow(prev => ({ ...prev, active: false }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tiltX, rotateY: tiltY }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      className="rounded-2xl border border-border/60 bg-card/50 dark:bg-card/30 backdrop-blur-md p-6 shadow-sm relative overflow-hidden"
    >
      {/* Dynamic Cursor Glow Overlay */}
      {glow.active && isDesktop && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-20 dark:opacity-40 mix-blend-screen"
          style={{
            background: `radial-gradient(circle 250px at ${glow.x}px ${glow.y}px, var(--brand-orange, #f39200), transparent 80%)`,
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 relative z-10">
        <div className="flex bg-muted p-1 rounded-xl border border-border/80 shadow-inner">
          {(["skills", "attitudes", "knowledge"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === t
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "skills" ? (thai ? "ทักษะ" : "Skills") : t === "attitudes" ? (thai ? "ทัศนคติ" : "Attitudes") : (thai ? "ความรู้" : "Knowledge")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-1 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">{thai ? "เป้าหมายอาชีพ" : "Career Required"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-1 rounded-full bg-brand-orange" />
            <span className="text-muted-foreground">{thai ? "สมรรถนะของคุณ" : "Your Profile"}</span>
          </div>
        </div>
      </div>

      {/* Recharts Radar */}
      <div className="h-[360px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="var(--border)" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "var(--foreground)", fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
              stroke="var(--border)"
              tickCount={6}
            />
            <Radar
              name="Career Required"
              dataKey="career"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="transparent"
              dot={{ fill: "#3B82F6", r: 3.5, strokeWidth: 1.5, stroke: "var(--card)" }}
            />
            <Radar
              name="Your Profile"
              dataKey="student"
              stroke="#F39200"
              strokeWidth={2}
              fill="#F39200"
              fillOpacity={0.2}
              dot={{ fill: "#F39200", r: 3.5, strokeWidth: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. PriorityGapsList Component                                     */
/* ------------------------------------------------------------------ */
export function PriorityGapsList({ gaps }: PriorityGapsListProps) {
  const { lang } = useLanguage();
  const thai = lang === "th";

  const gapDetails = gaps.map((g) => ({
    skill: g.competency_id.replace(/^[ASK]\d{2}_/, "").replace(/_/g, " "),
    student: g.student_score,
    required: g.career_required,
    gap: g.gap_score,
    priority: g.gap_score >= 30 ? "Critical" : g.gap_score >= 20 ? "High" : "Medium",
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 dark:bg-card/30 backdrop-blur-md p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="font-extrabold text-foreground text-xl mb-1 tracking-tight">
          {thai ? "ช่องว่างสมรรถนะสำคัญ (Priority Gaps)" : "Priority Gaps"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {thai ? "เรียงลำดับตามผลกระทบต่อคะแนนรวมของอาชีพ" : "Ranked by impact on career match score"}
        </p>
      </div>

      <motion.ul
        className="flex flex-col gap-4 overflow-y-auto pr-1 max-h-[360px] custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {gapDetails.map((item) => (
          <motion.li
            key={item.skill}
            variants={itemVariants}
            className="group relative rounded-xl p-4 bg-muted/40 dark:bg-white/2 border border-border/50 dark:border-white/5 transition-all duration-300 hover:scale-[1.01] hover:bg-muted/60 dark:hover:bg-white/4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground tracking-wide">{item.skill}</span>
              <span
                className="text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border"
                style={{
                  background: `${priorityColors[item.priority]}15`,
                  color: priorityColors[item.priority],
                  borderColor: `${priorityColors[item.priority]}35`,
                }}
              >
                {item.priority === "Critical" ? (thai ? "วิกฤต" : "Critical") : item.priority === "High" ? (thai ? "สูง" : "High") : (thai ? "ปานกลาง" : "Medium")}
              </span>
            </div>

            {/* Overlapping Progress Bar */}
            <div className="relative h-2 rounded-full bg-muted-foreground/10 overflow-hidden mb-2">
              {/* Required bar (Blue background) */}
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${item.required}%`, background: "#3B82F6", opacity: 0.25 }}
              />
              {/* Student bar (Orange foreground) */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${item.student}%`, background: "#F39200" }}
                initial={{ width: "0%" }}
                whileInView={{ width: `${item.student}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>{thai ? "คะแนน:" : "Score:"} <span className="text-foreground font-semibold">{item.student}</span></span>
              <span className="text-red-500 font-bold">{thai ? "ห่าง:" : "Gap:"} {item.gap}</span>
              <span>{thai ? "ต้องการ:" : "Required:"} <span className="text-foreground font-semibold">{item.required}</span></span>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
