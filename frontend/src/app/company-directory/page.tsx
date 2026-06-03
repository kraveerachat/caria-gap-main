/**
 * /company-directory — the full "Industry Demand & Salary Insights" route.
 *
 * Split out of the landing page so the landing stays short (it now keeps only the
 * logo wall + CTA). This route carries the detail: a gradient hero header, the
 * in-demand roles overview carousel, and the company-by-company salary directory.
 */
"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import InDemandRoles from "@/components/InDemandRoles";
import CompanyDirectory from "@/components/CompanyDirectory";
import { useLanguage } from "@/components/language-provider";

export default function CompanyDirectoryPage() {
  const { lang } = useLanguage();
  const thai = lang === "th";

  return (
    <main className="relative bg-white dark:bg-[#050a14]">
      <SiteHeader />

      {/* Hero header — generous top padding to clear the fixed header, room to breathe */}
      <section className="relative overflow-hidden bg-white pt-32 pb-12 dark:bg-[#050a14] sm:pt-36 sm:pb-16">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-20 size-[28rem] rounded-full bg-[#F39200]/8 blur-[150px]" />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-10 size-[28rem] rounded-full bg-[#002F6C]/8 blur-[150px] dark:bg-[#1E90FF]/12" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Link
            href="/"
            className="group mb-7 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" strokeWidth={2.5} aria-hidden />
            <span className={thai ? "font-thai" : ""}>{thai ? "กลับหน้าหลัก" : "Back to home"}</span>
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#002F6C]/20 bg-[#002F6C]/5 px-4 py-1.5 text-xs font-bold text-[#002F6C] dark:border-[#1E90FF]/30 dark:bg-[#1E90FF]/10 dark:text-[#7FB0FF]">
            <Building2 className="size-3.5" strokeWidth={2.5} aria-hidden />
            <span className={thai ? "font-thai" : ""}>{thai ? "ฐานเงินเดือนจริง 2026" : "Real 2026 salary data"}</span>
          </div>

          <h1
            className={`mx-auto max-w-3xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl ${
              thai ? "font-thai leading-snug" : "font-syne leading-[1.08]"
            }`}
          >
            <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text pb-1 text-transparent">
              {thai
                ? "10 บริษัทชั้นนำในแต่ละสายอาชีพ พร้อมฐานเงินเดือนจริงปี 2026"
                : "Top companies in every career path, with real 2026 salaries"}
            </span>
          </h1>

          <p className={`mx-auto mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg ${thai ? "font-thai leading-relaxed" : "leading-relaxed"}`}>
            {thai
              ? "เลือกสายงานดิจิทัลที่กำลังมาแรง แล้วเจาะลึกบริษัทชั้นนำที่กำลังเปิดรับ พร้อมเส้นทางเงินเดือนจริงและสมรรถนะ CARIA ที่แต่ละที่ต้องการ"
              : "Pick an in-demand digital role, then dig into the leading companies hiring now, with real salary paths and the CARIA competencies they screen for."}
          </p>
        </div>
      </section>

      {/* Roles lens (overview) → employer lens (deep dive) */}
      <InDemandRoles />
      <CompanyDirectory />

      <SiteFooter />
    </main>
  );
}
