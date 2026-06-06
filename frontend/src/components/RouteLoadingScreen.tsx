"use client";

import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";

/**
 * Full-screen branded loader shown while a route guard reads localStorage (and
 * while the gateway forwards a returning visitor). Uses semantic theme tokens
 * so it matches the gateway in both light and dark.
 */
export function RouteLoadingScreen({ label }: { label?: string }) {
  const { lang } = useLanguage();
  const thai = lang === "th";
  const text = label ?? (thai ? "กำลังตรวจสอบสิทธิ์การเข้าถึง" : "Checking your access");

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-background text-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 50% 45%, rgba(243,146,0,0.10) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-6">
        <Logo />
        <div className="size-10 rounded-full border-2 border-border border-t-brand-orange motion-safe:animate-spin motion-reduce:animate-pulse" />
        <p className={`text-sm text-muted-foreground ${thai ? "font-thai" : ""}`}>{text}…</p>
      </div>
    </div>
  );
}
