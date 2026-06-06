"use client";

/**
 * CARIA-GAP entry gateway (route "/").
 *
 * First screen of the app: pick a segment (internal SUT student vs. external
 * guest), persist it to localStorage, then enter the landing page at /home.
 * Theme-adaptive (light/dark) via semantic tokens. Pure frontend mock.
 *
 * Returning visitors who already chose a segment are forwarded straight to
 * /home. The two background spheres are the real 3D nexus in decorative mode.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, UserRound, Lock, X, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";
import { hasMockRole } from "@/hooks/useMockAuth";
import { RouteLoadingScreen } from "@/components/RouteLoadingScreen";
import { GlobeBackdrop } from "@/components/GlobeBackdrop";

const ROLE_KEY = "sut_caria_role";
const AUTH_EVENT = "sut-auth-change";

type Role = "student" | "guest";

function persistRole(role: Role) {
  try {
    localStorage.setItem(ROLE_KEY, JSON.stringify({ role, ts: Date.now() }));
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {
    /* storage unavailable (private mode) — proceed without persistence */
  }
}

const COPY = {
  th: {
    welcome: "ยินดีต้อนรับสู่",
    sub: "กรุณาเลือกสถานะของคุณเพื่อเริ่มต้นการประเมิน",
    student: "นักศึกษา SUT",
    guest: "บุคคลทั่วไป",
    forwarding: "กำลังพาคุณเข้าสู่หน้าหลัก",
    toastTitle: "บันทึกสถิติการประเมิน",
    toast: "กรุณาล็อกอินก่อนทำแบบประเมิน เพื่อบันทึกการทำสถิติ",
    dismiss: "ปิดการแจ้งเตือน",
    badge: "เริ่มต้น",
  },
  en: {
    welcome: "Welcome to",
    sub: "Choose how you're joining to start the assessment.",
    student: "SUT student",
    guest: "Guest",
    forwarding: "Taking you to the homepage",
    toastTitle: "Save your results",
    toast: "Log in before the assessment to keep your statistics.",
    dismiss: "Dismiss notification",
    badge: "Get started",
  },
} as const;

export default function GatewayPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const thai = lang === "th";
  const t = thai ? COPY.th : COPY.en;
  const font = thai ? "font-thai" : "font-syne";
  const prefersReducedMotion = useReducedMotion();

  const [pending, setPending] = useState<Role | null>(null);
  const [toastOpen, setToastOpen] = useState(true);
  const [forwarding, setForwarding] = useState(false);

  // Returning visitor who already picked a segment: skip the picker, go to /home.
  useEffect(() => {
    if (hasMockRole()) {
      setForwarding(true);
      router.replace("/home");
    }
  }, [router]);

  function choose(role: Role) {
    if (pending) return;
    setPending(role);
    persistRole(role);
    router.push("/home");
  }

  if (forwarding) {
    return <RouteLoadingScreen label={t.forwarding} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ── Backdrop: ambient brand wash + two live nexus spheres ──────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 18% 16%, rgba(243,146,0,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 82% 86%, rgba(45,156,255,0.12) 0%, transparent 60%)",
          }}
        />
        <GlobeBackdrop />
        {/* Vignette fades the spheres into the themed background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 56% at 50% 50%, transparent 32%, var(--background) 100%)",
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
          className="w-full max-w-md rounded-3xl border border-border bg-card/70 p-7 shadow-2xl shadow-black/20 backdrop-blur-2xl dark:shadow-black/50 sm:max-w-lg sm:p-10"
        >
          <div className="mb-7 flex items-center justify-between gap-4">
            <Logo />
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t.badge}
            </span>
          </div>

          <h1
            id="gateway-heading"
            className={`text-balance text-3xl font-bold leading-tight sm:text-4xl ${font}`}
          >
            {t.welcome}{" "}
            <span className="text-[#9a5a00] dark:text-brand-orange">CARIA</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-secondary">GAP</span>
          </h1>

          <p className={`mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base ${thai ? "font-thai" : ""}`}>
            {t.sub}
          </p>

          {/* Choices: stacked on mobile, side-by-side from sm */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* SUT student — primary brand gradient, dark ink for contrast on the gradient */}
            <button
              type="button"
              onClick={() => choose("student")}
              disabled={pending !== null}
              aria-busy={pending === "student"}
              style={{
                backgroundImage:
                  "linear-gradient(118deg, #F39200 0%, #FF8A00 42%, #2D9CFF 100%)",
              }}
              className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-[#0a1224] shadow-[0_10px_34px_-8px_rgba(243,146,0,0.5)] outline-none transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-8px_rgba(45,156,255,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:hover:translate-y-0"
            >
              {pending === "student" ? (
                <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
              ) : (
                <GraduationCap className="size-5" strokeWidth={2.25} aria-hidden />
              )}
              <span className={`text-sm font-bold ${thai ? "font-thai" : ""}`}>{t.student}</span>
            </button>

            {/* Guest — subtle outline that adapts to the theme */}
            <button
              type="button"
              onClick={() => choose("guest")}
              disabled={pending !== null}
              aria-busy={pending === "guest"}
              className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-border bg-transparent px-5 py-4 text-foreground outline-none transition-colors duration-200 hover:border-foreground/30 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending === "guest" ? (
                <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
              ) : (
                <UserRound className="size-5" strokeWidth={2.25} aria-hidden />
              )}
              <span className={`text-sm font-bold ${thai ? "font-thai" : ""}`}>{t.guest}</span>
            </button>
          </div>
        </motion.section>
      </div>

      {/* ── Login-nudge toast (bottom-right) ───────────────────────────── */}
      {toastOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 duration-500 animate-in fade-in slide-in-from-bottom-4 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm sm:slide-in-from-right-8 motion-reduce:animate-none"
        >
          <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl border border-brand-orange/30 bg-popover/95 p-4 pr-10 shadow-2xl shadow-black/20 backdrop-blur-xl dark:shadow-black/60">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-brand-orange/30 bg-brand-orange/10 text-brand-orange motion-safe:animate-glow-pulse">
              <Lock className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className={`text-sm font-semibold text-foreground ${thai ? "font-thai" : ""}`}>
                {t.toastTitle}
              </p>
              <p className={`mt-0.5 text-xs leading-relaxed text-muted-foreground ${thai ? "font-thai leading-relaxed" : ""}`}>
                {t.toast}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastOpen(false)}
              aria-label={t.dismiss}
              className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-orange"
            >
              <X className="size-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
