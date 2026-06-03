"use client";

/**
 * CARIA-GAP Gateway / segmentation screen.
 *
 * Sits in front of the assessment and asks the visitor which segment they are
 * (internal SUT DIGITECH student vs. external guest), persisting the choice to
 * localStorage before routing into /assessment. Pure frontend mock: no backend.
 *
 * The two background "globes" reuse the Hero nexus render (a pre-rendered webp)
 * rather than two live WebGL canvases — same look, none of the GPU cost, and it
 * never crashes a phone. Swap in the live <InteractiveCareerSphere> here if a
 * real-time backdrop is ever needed on capable desktops.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, UserRound, Lock, X, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";

// Vendored locally (public/hero-orb.webp) so the backdrop never depends on a
// remote CDN. A CSS radial-gradient orb sits behind it as a guaranteed fallback,
// so a missing asset degrades gracefully instead of showing a broken image.
const ORB_SRC = "/hero-orb.webp";

const ROLE_KEY = "sut_caria_role";
const AUTH_EVENT = "sut-auth-change";

type Role = "student" | "guest";

function persistRole(role: Role) {
  try {
    localStorage.setItem(ROLE_KEY, JSON.stringify({ role, ts: Date.now() }));
    // Mirror mock-auth's broadcast so the header/profile can react if listening.
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {
    /* storage unavailable (private mode) — proceed without persistence */
  }
}

const COPY = {
  th: {
    welcome: "ยินดีต้อนรับสู่",
    sub: "กรุณาเลือกสถานะของคุณเพื่อเริ่มต้นการประเมิน",
    student: "นักศึกษาคณะ DIGITECH SUT",
    studentHint: "เชื่อมผลประเมินเข้ากับหลักสูตร SUT ของคุณ",
    guest: "บุคคลทั่วไป / นักเรียนมัธยม",
    guestHint: "สำรวจเส้นทางอาชีพแบบผู้เยี่ยมชม",
    loading: "กำลังเข้าสู่แบบประเมิน",
    toastTitle: "บันทึกสถิติการประเมิน",
    toast: "กรุณาล็อกอินก่อนทำแบบประเมิน เพื่อบันทึกการทำสถิติ",
    dismiss: "ปิดการแจ้งเตือน",
  },
  en: {
    welcome: "Welcome to",
    sub: "Choose how you're joining so we can tailor the assessment.",
    student: "DIGITECH SUT student",
    studentHint: "Link your results to your SUT curriculum.",
    guest: "Guest / high-school student",
    guestHint: "Explore career paths as a visitor.",
    loading: "Opening the assessment",
    toastTitle: "Save your results",
    toast: "Log in before the assessment to keep your statistics.",
    dismiss: "Dismiss notification",
  },
} as const;

function DecorGlobe({ corner }: { corner: "tl" | "br" }) {
  const prefersReducedMotion = useReducedMotion();
  const isTL = corner === "tl";
  const [imgOk, setImgOk] = useState(true);

  return (
    <div
      className={[
        "absolute h-[62vmin] w-[62vmin] scale-100 sm:scale-125 lg:scale-150",
        isTL
          ? "left-0 top-0 -translate-x-1/3 -translate-y-1/3"
          : "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
      ].join(" ")}
    >
      {/* Ambient color wash, warmer top-left / cooler bottom-right */}
      <div
        className="absolute inset-[6%] rounded-full blur-2xl"
        style={{
          background: isTL
            ? "radial-gradient(circle, rgba(243,146,0,0.16) 0%, transparent 68%)"
            : "radial-gradient(circle, rgba(45,156,255,0.18) 0%, transparent 68%)",
        }}
      />
      {/* Slow counter-rotating rings echo the Hero nexus */}
      <motion.div
        className="absolute inset-[3%] rounded-full"
        style={{ border: "1px solid rgba(243,146,0,0.12)" }}
        animate={prefersReducedMotion ? undefined : { rotate: isTL ? 360 : -360 }}
        transition={{ duration: 64, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[16%] rounded-full"
        style={{ border: "1px solid rgba(45,156,255,0.12)" }}
        animate={prefersReducedMotion ? undefined : { rotate: isTL ? -360 : 360 }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
      />
      {/* Orb body + render float together. The CSS sphere is always painted, so
          a missing/blocked webp degrades to a glowing orb, never a broken image. */}
      <div className="absolute inset-0 motion-safe:animate-float-slow">
        <div
          className="absolute inset-[8%] rounded-full"
          style={{
            background: isTL
              ? "radial-gradient(circle at 38% 30%, rgba(255,206,138,0.32), transparent 44%), radial-gradient(circle at 50% 52%, #123154 0%, #0c2240 52%, #050f22 100%)"
              : "radial-gradient(circle at 62% 34%, rgba(140,196,255,0.32), transparent 44%), radial-gradient(circle at 50% 52%, #0e2b50 0%, #0a1f3c 52%, #050d1e 100%)",
            boxShadow: "inset 0 0 70px rgba(0,0,0,0.55)",
          }}
        />
        {imgOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ORB_SRC}
            alt=""
            aria-hidden
            draggable={false}
            onError={() => setImgOk(false)}
            className="absolute inset-0 h-full w-full select-none object-contain"
          />
        )}
      </div>
    </div>
  );
}

export default function GatewayPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const thai = lang === "th";
  const t = thai ? COPY.th : COPY.en;
  const font = thai ? "font-thai" : "font-syne";
  const prefersReducedMotion = useReducedMotion();

  const [pending, setPending] = useState<Role | null>(null);
  const [toastOpen, setToastOpen] = useState(true);

  function choose(role: Role) {
    if (pending) return;
    setPending(role);
    persistRole(role);
    // Carry through any deep-link query (e.g. ?career=ID from the hero explorer).
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.push(`/assessment${search}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* ── Cinematic backdrop ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Deep-space base + warm/cool corner glows */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 22% 18%, #0b1626 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 80% 86%, #081226 0%, transparent 60%), #030712",
          }}
        />
        {/* Faint reference grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,156,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(45,156,255,1) 1px, transparent 1px)",
            backgroundSize: "84px 84px",
          }}
        />
        {/* The two globes, dimmed so they never fight the card */}
        <div className="absolute inset-0 opacity-40">
          <DecorGlobe corner="tl" />
          <DecorGlobe corner="br" />
        </div>
        {/* Vignette to seat the card */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 30%, rgba(3,7,18,0.72) 100%)",
          }}
        />
      </div>

      {/* ── Selection card ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-16 sm:px-6">
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          aria-labelledby="gateway-heading"
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:max-w-lg sm:p-10"
        >
          {/* Soft top sheen on the glass */}
          <div className="mb-7 flex items-center justify-between gap-4">
            <Logo />
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/55">
              {thai ? "เริ่มต้น" : "Get started"}
            </span>
          </div>

          <h1
            id="gateway-heading"
            className={`text-balance text-3xl font-bold leading-tight sm:text-4xl ${font}`}
          >
            {t.welcome}{" "}
            <span className="text-brand-orange">CARIA</span>
            <span className="text-white/40">-</span>
            <span className="text-[#2D9CFF]">GAP</span>
          </h1>

          <p className={`mt-3 max-w-prose text-[15px] leading-relaxed text-slate-300 sm:text-base ${thai ? "font-thai" : ""}`}>
            {t.sub}
          </p>

          {/* Choices: stacked on mobile, side-by-side from sm */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* Internal SUT student — primary, brand gradient, dark ink for contrast */}
            <button
              type="button"
              onClick={() => choose("student")}
              disabled={pending !== null}
              aria-busy={pending === "student"}
              style={{
                backgroundImage:
                  "linear-gradient(118deg, #F39200 0%, #FF8A00 42%, #2D9CFF 100%)",
              }}
              className="group relative flex flex-1 items-center gap-3 rounded-2xl px-5 py-4 text-left text-[#0a1224] shadow-[0_10px_34px_-8px_rgba(243,146,0,0.55)] outline-none transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-8px_rgba(45,156,255,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:hover:translate-y-0"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-black/15">
                {pending === "student" ? (
                  <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
                ) : (
                  <GraduationCap className="size-5" strokeWidth={2.25} aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold leading-snug ${thai ? "font-thai" : ""}`}>
                  {pending === "student" ? `${t.loading}…` : t.student}
                </span>
                <span className={`mt-0.5 block text-xs font-medium text-[#0a1224] ${thai ? "font-thai" : ""}`}>
                  {t.studentHint}
                </span>
              </span>
            </button>

            {/* External guest — subtle glass, equal weight in the grid */}
            <button
              type="button"
              onClick={() => choose("guest")}
              disabled={pending !== null}
              aria-busy={pending === "guest"}
              className="group relative flex flex-1 items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-left text-white outline-none transition-colors duration-200 hover:border-white/25 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F39200] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white/85">
                {pending === "guest" ? (
                  <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
                ) : (
                  <UserRound className="size-5" strokeWidth={2.25} aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold leading-snug ${thai ? "font-thai" : ""}`}>
                  {pending === "guest" ? `${t.loading}…` : t.guest}
                </span>
                <span className={`mt-0.5 block text-xs font-medium text-white/55 ${thai ? "font-thai" : ""}`}>
                  {t.guestHint}
                </span>
              </span>
            </button>
          </div>
        </motion.section>
      </div>

      {/* ── Login nudge toast (bottom-right) ───────────────────────────── */}
      {toastOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 duration-500 animate-in fade-in slide-in-from-bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm sm:slide-in-from-right-8 motion-reduce:animate-none"
        >
          <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl border border-[#F39200]/30 bg-[#0a1018]/90 p-4 pr-10 shadow-2xl shadow-black/60 backdrop-blur-xl">
            {/* Pulsing glow seated behind the icon */}
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-[#F39200]/30 bg-[#F39200]/10 text-brand-orange motion-safe:animate-glow-pulse">
              <Lock className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className={`text-sm font-semibold text-white ${thai ? "font-thai" : ""}`}>
                {t.toastTitle}
              </p>
              <p className={`mt-0.5 text-xs leading-relaxed text-slate-300 ${thai ? "font-thai leading-relaxed" : ""}`}>
                {t.toast}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastOpen(false)}
              aria-label={t.dismiss}
              className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-lg text-white/45 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#F39200]"
            >
              <X className="size-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
