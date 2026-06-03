/**
 * CariaDownloadButton — downloads the CARIA Competency Report as a PDF.
 *
 * Presentational + behavior wrapper around a `capture()` provided by
 * useCariaReport. Reused on the dashboard "Next Steps" section and the profile
 * page so the download affordance is identical in both places.
 */
"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { downloadBlob } from "@/lib/caria-report";
import { showToast } from "@/lib/utils";

export default function CariaDownloadButton({
  capture,
  ready,
  userId,
  variant = "secondary",
  className = "",
}: {
  capture: () => Promise<Blob>;
  ready: boolean;
  userId: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { lang } = useLanguage();
  const thai = lang === "th";
  const [downloading, setDownloading] = useState(false);

  async function handleClick() {
    if (!ready || downloading) return;
    try {
      setDownloading(true);
      const blob = await capture();
      downloadBlob(blob, `CARIA_Competency_Report_${userId}.pdf`);
      showToast(thai ? "ดาวน์โหลดผลประเมิน CARIA แล้ว" : "CARIA report downloaded", "success");
    } catch (err) {
      console.error("CARIA report download failed", err);
      showToast(thai ? "ดาวน์โหลดไม่สำเร็จ กรุณาลองใหม่" : "Download failed, please try again", "error");
    } finally {
      setDownloading(false);
    }
  }

  const base =
    "inline-flex h-12 items-center justify-center gap-2.5 rounded-xl px-5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";
  const skin =
    variant === "primary"
      ? "bg-brand-orange text-brand-orange-foreground shadow-md hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]"
      : "border border-border bg-card/60 text-foreground hover:bg-muted hover:border-border/80 active:scale-[0.99] dark:bg-white/5";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready || downloading}
      aria-busy={downloading}
      className={`${base} ${skin} ${className}`}
    >
      {downloading || !ready ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Download className="size-4" strokeWidth={2.25} aria-hidden />
      )}
      {downloading
        ? thai
          ? "กำลังสร้าง PDF..."
          : "Generating PDF..."
        : !ready
          ? thai
            ? "กำลังเตรียม..."
            : "Preparing..."
          : thai
            ? "ดาวน์โหลดผลประเมิน CARIA (PDF)"
            : "Download CARIA report (PDF)"}
    </button>
  );
}
