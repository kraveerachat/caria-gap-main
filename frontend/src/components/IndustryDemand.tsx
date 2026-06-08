/**
 * CARIA-GAP — Industry Demand (landing teaser)
 *
 * The landing keeps only the hook: an infinite logo wall of hiring organisations
 * and a single CTA into the full salary directory (/company-directory). The role
 * carousel and the company zig-zag now live on that dedicated route, so the
 * landing stays short.
 *
 * Logos load from /public/companies/{global,thai}/. Only paths listed in
 * AVAILABLE_LOGOS are requested; every other slot renders a clean monochrome
 * wordmark and is never fetched, so the wall shows no broken images and makes
 * no 404 requests for absent artwork. Listed logos are probed once (module
 * cache) so duplicated marquee copies don't re-request.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Company = { name: string; src?: string };

// Logo files that actually exist under /public/companies. Anything not listed
// here renders a wordmark and is NEVER requested, so the marquee no longer
// probes absent files (those probes were the /companies/**.svg 404s). To
// upgrade a wordmark to artwork: drop the SVG in the folder, then add its path.
const AVAILABLE_LOGOS = new Set<string>([
  "/companies/global/google.svg",
  "/companies/global/microsoft.svg",
  "/companies/global/meta.svg",
  "/companies/global/nvidia.svg",
  "/companies/global/netflix.svg",
  "/companies/global/oracle.svg",
  "/companies/global/adobe.svg",
  "/companies/global/salesforce.svg",
  "/companies/global/spotify.svg",
  "/companies/global/ibm.svg",
]);

function withLogos(region: "global" | "thai", names: string[]): Company[] {
  return names.map((name) => {
    const path = `/companies/${region}/${name.toLowerCase()}.svg`;
    return { name, src: AVAILABLE_LOGOS.has(path) ? path : undefined };
  });
}

const GLOBAL_COMPANIES: Company[] = withLogos("global", [
  "Google", "Microsoft", "Amazon", "Meta", "NVIDIA", "Apple",
  "Netflix", "Oracle", "Adobe", "Salesforce", "Spotify", "IBM",
]);

const THAI_COMPANIES: Company[] = withLogos("thai", [
  "SCB", "KBank", "PTT", "AIS", "True", "SCG",
  "Agoda", "LINE", "Bitkub", "KBTG", "Sertis", "CP",
]);

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

function useLogoLoaded(src?: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!src) {
      setLoaded(false);
      return;
    }
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
      {src && loaded ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={hidden ? "" : name} loading="lazy" className="max-h-8 max-w-full object-contain" />
      ) : (
        <span className="font-heading text-base font-bold tracking-tight text-muted-foreground transition-colors group-hover/logo:text-foreground">
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

export default function IndustryDemand() {
  const { lang } = useLanguage();
  const thai = lang === "th";

  return (
    <section id="industry-demand" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-[#070d1a] sm:py-28">
      {/* Ambient SUT navy + orange */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 size-96 rounded-full bg-brand-blue/10 blur-[130px] dark:bg-brand-blue/30" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 size-96 rounded-full bg-brand-orange/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* The hook — a massive premium headline over the logo wall */}
        <h2
          className={`mx-auto max-w-4xl text-center text-4xl font-extrabold tracking-tight text-balance md:text-6xl ${
            thai ? "font-thai leading-snug" : "font-heading leading-[1.05]"
          }`}
        >
          <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text pb-1 text-transparent">
            {thai ? "บริษัทชั้นนำระดับโลก กำลังมองหาทักษะแบบคุณ" : "Top global companies are looking for your skills"}
          </span>
        </h2>
        <p className={`mx-auto mt-5 max-w-2xl text-center text-base text-slate-600 dark:text-slate-300 sm:text-lg ${thai ? "font-thai leading-relaxed" : "leading-relaxed"}`}>
          {thai
            ? "บริษัทเทคและมีเดียชั้นนำทั้งไทยและระดับโลกกำลังเปิดรับคนรุ่นใหม่ที่มีทักษะดิจิทัลแบบที่คุณกำลังจะมี"
            : "Leading Thai and global tech & media employers are hiring for the digital skills you're about to build."}
        </p>

        {/* Logo wall */}
        <div className="mt-12 flex flex-col gap-6">
          <MarqueeRow items={GLOBAL_COMPANIES} label={thai ? "นายจ้างระดับโลก" : "Global employers"} />
          <MarqueeRow items={THAI_COMPANIES} reverse label={thai ? "นายจ้างชั้นนำของไทย" : "Leading Thai employers"} />
        </div>

        {/* CTA into the full salary directory route */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/company-directory"
            className="group inline-flex items-center gap-2.5 rounded-full border border-[#002F6C]/25 bg-white/70 px-7 py-3.5 text-base font-bold text-[#002F6C] shadow-sm backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-[#002F6C]/50 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:scale-100 dark:border-[#1E90FF]/30 dark:bg-white/5 dark:text-[#7FB0FF]"
          >
            <span className={thai ? "font-thai" : "font-heading"}>
              {thai ? "[ ดูข้อมูลเพิ่มเติม ]" : "[ View more ]"}
            </span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
