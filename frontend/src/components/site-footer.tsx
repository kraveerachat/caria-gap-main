import Link from "next/link";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

/**
 * Global site footer for SUT-CARIA.
 *
 * Permanently dark (#0B0F19) regardless of the active theme: a deep, calm
 * anchor that reads as a university-backed product surface in both light and
 * dark mode. Content is Thai-first (the institutional source data); Thai text
 * uses `font-thai` (IBM Plex Sans Thai) since `font-heading` (Outfit) is
 * Latin-only and would silently drop Thai glyphs. The Latin wordmark keeps
 * `font-heading`.
 */

// ---- Link data ---------------------------------------------------------------

type FooterLink = { label: string; href: string };

// Internal prototype routes (Next.js client navigation).
const PRODUCT_LINKS: FooterLink[] = [
  { label: "วิธีการทำงาน", href: "/#how-it-works" },
  { label: "แบบประเมิน AI 81 ข้อ", href: "/assessment" },
  { label: "ระบบ What-if Simulator", href: "/dashboard" },
  { label: "เจาะลึกบริษัทชั้นนำ", href: "/company-directory" },
  { label: "แดชบอร์ดสำหรับองค์กร (B2B)", href: "/b2b-portal" },
];

// DIGITECH academic pages (external, new tab).
const ACADEMIC_LINKS: FooterLink[] = [
  { label: "ปริญญาตรี เทคโนโลยีดิจิทัล (DT)", href: "https://digitech.sut.ac.th/digital-technology" },
  { label: "ปริญญาตรี นิเทศศาสตร์ดิจิทัล (DC)", href: "https://digitech.sut.ac.th/digital-communication" },
  { label: "ระดับปริญญาโท", href: "https://digitech.sut.ac.th/digital-master" },
  { label: "ระดับปริญญาเอก", href: "https://digitech.sut.ac.th/digital-phd" },
  { label: "หลักสูตรสัมฤทธิบัตร", href: "https://digitech.sut.ac.th/apply-certificate" },
];

// SUT institutional resources (external, new tab).
const RESOURCE_LINKS: FooterLink[] = [
  { label: "ประวัติ มทส.", href: "https://www.sut.ac.th/content/detail/%e0%b8%9b%e0%b8%a3%e0%b8%b0%e0%b8%a7%e0%b8%b1%e0%b8%95%e0%b8%b4-%e0%b8%a1%e0%b8%97%e0%b8%aa-" },
  { label: "ติดต่อ มทส.", href: "https://www.sut.ac.th/cont2sut/" },
  { label: "คำถามที่พบบ่อย", href: "https://digitech.sut.ac.th/fag" },
  { label: "ร่วมให้ทุนการศึกษา", href: "https://digitech.sut.ac.th/giving" },
  { label: "นโยบายความเป็นส่วนตัว (PDPA)", href: "https://pdpa.sut.ac.th/" },
];

// ---- Social brand glyphs (currentColor; inherit the link's text color) -------

const ICON = "size-[18px]";

const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/DigiTech.TH/",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@digitechsut9595",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@digitech_sut",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/digitech-digital-arts-and-science-9389a436b/",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "LINE Sticker Shop",
    href: "https://store.line.me/stickershop/author/1692892/th",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden="true">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
      </svg>
    ),
  },
];

// ---- Reusable link column (cols 2-4) -----------------------------------------

function LinkColumn({
  title,
  links,
  external,
}: {
  title: string;
  links: FooterLink[];
  external?: boolean;
}) {
  return (
    <nav aria-label={title}>
      <h3 className="font-thai mb-6 text-base font-semibold text-white">{title}</h3>
      <ul className="flex flex-col gap-4">
        {links.map((link) =>
          external ? (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-start font-thai text-sm leading-snug text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] rounded-sm"
              >
                <span>{link.label}</span>
                <ArrowUpRight
                  className="ml-1.5 mt-0.5 size-3.5 shrink-0 text-slate-500 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </a>
            </li>
          ) : (
            <li key={link.label}>
              <Link
                href={link.href}
                className="inline-block font-thai text-sm leading-snug text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] rounded-sm"
              >
                {link.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}

// ---- Footer ------------------------------------------------------------------

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0B0F19] text-slate-400 border-t border-slate-950">
      {/* Premium ambient glows */}
      <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-[#F39200]/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#1e90ff]/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:gap-16">
          {/* Column 1 — Brand & contact */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              aria-label="SUT-CARIA — หน้าแรก"
              className="group inline-flex w-fit items-center gap-3 font-heading text-2xl font-extrabold tracking-tight rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]"
            >
              <img
                src="/sut-caria-logo.png"
                alt=""
                className="size-8 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <span className="text-white transition-colors duration-300 group-hover:text-slate-100">SUT</span>
                <span className="text-[#F39200] transition-colors duration-300 group-hover:text-[#ffb54d]">-CARIA</span>
              </div>
            </Link>

            <p className="font-thai max-w-xs text-sm leading-loose text-slate-400 text-pretty">
              ระบบวิเคราะห์ช่องว่างสมรรถนะเพื่อแนะนำเส้นทางอาชีพดิจิทัล ค้นหาเส้นทางอาชีพดิจิทัลที่ใช่สำหรับคุณ
            </p>

            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F39200]/10 text-[#F39200]">
                  <MapPin className="size-4" strokeWidth={2.25} aria-hidden="true" />
                </div>
                <span className="font-thai leading-relaxed text-slate-400">
                  111{" "}
                  <span className="whitespace-nowrap">มหาวิทยาลัยเทคโนโลยีสุรนารี</span>{" "}
                  <span className="whitespace-nowrap">ต.สุรนารี</span>{" "}
                  <span className="whitespace-nowrap">อ.เมือง</span>{" "}
                  <span className="whitespace-nowrap">จ.นครราชสีมา</span> 30000
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F39200]/10 text-[#F39200]">
                  <Phone className="size-4" strokeWidth={2.25} aria-hidden="true" />
                </div>
                <a
                  href="tel:+6644225789"
                  className="font-thai text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] rounded-sm"
                >
                  044-225789
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F39200]/10 text-[#F39200]">
                  <Mail className="size-4" strokeWidth={2.25} aria-hidden="true" />
                </div>
                <a
                  href="mailto:digitech@sut.ac.th"
                  className="font-thai text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] rounded-sm"
                >
                  digitech@sut.ac.th
                </a>
              </li>
            </ul>

            <ul className="flex flex-wrap items-center gap-3">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] active:scale-95 motion-reduce:transition-none"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Product (internal) */}
          <LinkColumn title="ผลิตภัณฑ์และบริการ" links={PRODUCT_LINKS} />

          {/* Column 3 — DIGITECH academic (external) */}
          <LinkColumn title="หลักสูตรและการรับสมัคร" links={ACADEMIC_LINKS} external />

          {/* Column 4 — SUT resources (external) */}
          <LinkColumn title="องค์กรและทรัพยากร" links={RESOURCE_LINKS} external />
        </div>

        {/* Copyright bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/40 pt-8 md:flex-row">
          <p className="font-thai text-center text-xs leading-relaxed text-slate-400 md:text-left">
            © 2026 SUT-CARIA &amp; สำนักวิชาศาสตร์และศิลป์ดิจิทัล มทส. สงวนลิขสิทธิ์.
          </p>
          <p className="font-thai text-center text-xs leading-relaxed text-slate-400 md:text-right">
            พัฒนาโดยทีม CARIA ที่จริงใจ{" "}
            <span
              className="inline-block transition-transform duration-300 hover:scale-125 hover:rotate-6 cursor-default active:scale-90"
              aria-hidden="true"
            >
              🧡
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
