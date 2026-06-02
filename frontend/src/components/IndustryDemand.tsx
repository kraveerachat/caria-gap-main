/**
 * CARIA-GAP — Industry Demand & Dream Destinations
 * Landing proof section: an infinite logo wall of hiring organisations, the
 * three highest-demand digital roles with real 2026 compensation, and the
 * master CTA into the assessment.
 *
 * Logos load from /public/companies/{global,thai}/. Until a file is present
 * each slot renders a clean monochrome wordmark, so the wall never shows a
 * broken image and upgrades to artwork automatically when assets are added.
 * Each unique src is probed once (module cache) so duplicated marquee copies
 * don't re-request the same file.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Database, Code2, Cloud, TrendingUp, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Company = { name: string; src: string };

const GLOBAL_COMPANIES: Company[] = [
  "Google", "Microsoft", "Amazon", "Meta", "NVIDIA", "Apple",
  "Netflix", "Oracle", "Adobe", "Salesforce", "Spotify", "IBM",
].map((name) => ({ name, src: `/companies/global/${name.toLowerCase()}.svg` }));

const THAI_COMPANIES: Company[] = [
  "SCB", "KBank", "PTT", "AIS", "True", "SCG",
  "Agoda", "LINE", "Bitkub", "KBTG", "Sertis", "CP",
].map((name) => ({ name, src: `/companies/thai/${name.toLowerCase()}.svg` }));

const ROLES = [
  {
    Icon: Database,
    nameTh: "นักวิทยาศาสตร์ข้อมูล",
    nameEn: "Data Scientist",
    salary: "฿55K – ฿150K",
    demand: 28,
    skills: ["S14_Mathematics", "S03_Complex_Problem_Solving", "S20_Programming"],
  },
  {
    Icon: Code2,
    nameTh: "นักพัฒนาซอฟต์แวร์",
    nameEn: "Software Developer",
    salary: "฿45K – ฿120K",
    demand: 24,
    skills: ["S20_Programming", "S26_Systems_Design", "K05_Computers_and_Electronics"],
  },
  {
    Icon: Cloud,
    nameTh: "สถาปนิกระบบคลาวด์",
    nameEn: "Cloud Architect",
    salary: "฿70K – ฿180K",
    demand: 31,
    skills: ["S25_Systems_Analysis", "K05_Computers_and_Electronics", "S28_Troubleshooting"],
  },
] as const;

const EDGE_MASK =
  "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)";

/* ---- Probe each logo URL once, shared across every rendered copy ---- */
const logoProbes = new Map<string, Promise<boolean>>();
function probeLogo(src: string): Promise<boolean> {
  let pending = logoProbes.get(src);
  if (!pending) {
    pending = new Promise<boolean>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
    logoProbes.set(src, pending);
  }
  return pending;
}

function useLogoLoaded(src: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    probeLogo(src).then((ok) => {
      if (active) setLoaded(ok);
    });
    return () => {
      active = false;
    };
  }, [src]);
  return loaded;
}

/* ---- Logo: render artwork if present, else a wordmark fallback ---- */
function Logo({ name, src, hidden = false }: Company & { hidden?: boolean }) {
  const loaded = useLogoLoaded(src);

  return (
    <div
      aria-hidden={hidden || undefined}
      className="group/logo flex h-12 w-32 shrink-0 items-center justify-center opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
    >
      {loaded ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={hidden ? "" : name} loading="lazy" className="max-h-8 max-w-full object-contain" />
      ) : (
        <span className="font-syne text-base font-bold tracking-tight text-muted-foreground transition-colors group-hover/logo:text-foreground">
          {name}
        </span>
      )}
    </div>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  label,
}: {
  items: Company[];
  reverse?: boolean;
  label: string;
}) {
  // Duplicate the set so the track loops seamlessly; the copy is decorative,
  // so it's hidden from assistive tech to avoid reading every name twice.
  const doubled = [...items, ...items];
  return (
    <div
      role="group"
      aria-label={label}
      className="marquee overflow-hidden"
      style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
    >
      <div className={`flex w-max gap-12 pr-12 ${reverse ? "marquee-track-rev" : "marquee-track"}`}>
        {doubled.map((c, i) => (
          <Logo key={`${c.name}-${i}`} name={c.name} src={c.src} hidden={i >= items.length} />
        ))}
      </div>
    </div>
  );
}

/* ---- Pointer-tilt demand card ---- */
function DemandCard({ role, thai, index }: { role: (typeof ROLES)[number]; thai: boolean; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

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
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      animate={reduce ? undefined : { rotateX: tilt.rx, rotateY: tilt.ry }}
      style={{ transformPerspective: 900, transformStyle: "preserve-3d" }}
      className="group relative rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-[0_18px_50px_-30px_rgba(0,16,40,0.3)] backdrop-blur-xl transition-colors duration-300 hover:border-brand-orange/40 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-brand-orange/40"
    >
      <div className="flex items-center justify-between" style={{ transform: "translateZ(28px)" }}>
        <div className="flex size-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue dark:bg-white/5 dark:text-[#7FB0FF]">
          <role.Icon className="size-5" strokeWidth={2.25} aria-hidden />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-2.5 py-1 font-syne text-xs font-bold tabular-nums text-brand-orange">
          <TrendingUp className="size-3.5" strokeWidth={2.75} aria-hidden />
          +{role.demand}% · 2026
        </span>
      </div>

      <h3
        className={`mt-5 text-xl font-bold text-slate-900 dark:text-white ${thai ? "font-thai leading-relaxed" : "font-syne"}`}
        style={{ transform: "translateZ(20px)" }}
      >
        {thai ? role.nameTh : role.nameEn}
      </h3>

      <div className="mt-1 flex items-baseline gap-1.5" style={{ transform: "translateZ(16px)" }}>
        <span className="font-syne text-2xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
          {role.salary}
        </span>
        <span className={`text-sm text-muted-foreground ${thai ? "font-thai" : ""}`}>
          {thai ? "/ เดือน" : "/ month"}
        </span>
      </div>

      <div className="mt-5 border-t border-slate-200/70 pt-4 dark:border-white/10">
        <p className={`mb-2.5 text-xs font-medium text-muted-foreground ${thai ? "font-thai" : ""}`}>
          {thai ? "สมรรถนะหลักที่ต้องมี" : "Core competencies required"}
        </p>
        <div className="flex flex-wrap gap-2">
          {role.skills.map((s) => {
            const code = s.slice(0, 3);
            const label = s.slice(4).replace(/_/g, " ");
            return (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 text-xs dark:border-white/10 dark:bg-white/5"
              >
                <span className="font-mono font-bold text-brand-orange">{code}</span>
                <span className="text-slate-600 dark:text-slate-300">{label}</span>
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function IndustryDemand() {
  const { lang } = useLanguage();
  const thai = lang === "th";

  return (
    <section id="industry-demand" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-[#070d1a] sm:py-28">
      {/* Ambient SUT navy + orange */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 size-96 rounded-full bg-brand-blue/10 blur-[130px] dark:bg-brand-blue/30" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 size-96 rounded-full bg-brand-orange/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Logo wall — the hook */}
        <p className={`mb-7 text-center text-sm text-muted-foreground ${thai ? "font-thai leading-relaxed" : ""}`}>
          {thai
            ? "องค์กรชั้นนำทั้งในไทยและระดับโลกที่กำลังมองหาบุคลากรทักษะดิจิทัล"
            : "Thai and global organisations hiring for digital competencies"}
        </p>
        <div className="flex flex-col gap-6">
          <MarqueeRow
            items={GLOBAL_COMPANIES}
            label={thai ? "นายจ้างระดับโลก" : "Global employers"}
          />
          <MarqueeRow
            items={THAI_COMPANIES}
            reverse
            label={thai ? "นายจ้างชั้นนำของไทย" : "Leading Thai employers"}
          />
        </div>

        {/* Heading */}
        <div className="mx-auto mt-20 max-w-3xl text-center">
          <h2 className={`text-4xl font-bold tracking-tight text-balance text-slate-900 dark:text-white sm:text-5xl ${thai ? "font-thai leading-relaxed" : "font-syne leading-tight"}`}>
            {thai ? "บริษัทชั้นนำกำลังมองหาทักษะแบบคุณ" : "Top employers are hiring for these skills"}
          </h2>
          <p className={`mx-auto mt-4 max-w-2xl text-lg text-muted-foreground ${thai ? "font-thai leading-loose" : "leading-relaxed"}`}>
            {thai
              ? "ความต้องการบุคลากรดิจิทัลทั้งในไทยและตลาดโลกเติบโตต่อเนื่อง นี่คือสายงานมาแรงพร้อมค่าตอบแทนจริงในปี 2026"
              : "Demand for digital talent keeps climbing across Thai and global employers. Here are the in-demand roles with real 2026 compensation."}
          </p>
        </div>

        {/* In-demand roles */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {ROLES.map((role, i) => (
            <DemandCard key={role.nameEn} role={role} thai={thai} index={i} />
          ))}
        </div>

        {/* Master CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/assessment"
            className={`animate-glow-pulse group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-orange px-10 py-4 text-center text-lg font-bold text-brand-orange-foreground transition-transform duration-300 hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-[#070d1a] ${thai ? "font-thai leading-relaxed" : "font-syne"}`}
          >
            {thai ? "วิเคราะห์โอกาสของคุณ และปลดล็อก Roadmap" : "Analyze your opportunity and unlock your roadmap"}
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
