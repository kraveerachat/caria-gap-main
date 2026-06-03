/**
 * NextSteps — the dashboard's conversion section for the B2B lead-gen flow.
 *
 * Sits below the Top-10 results and the competency radar. Offers two actions:
 *   1. Download the CARIA Competency Report as a PDF (keep / reuse anytime).
 *   2. Open the Fast-Track application modal to apply to the SUT Digitech school.
 *
 * The modal carries helpful external links, a downloadable blank application
 * form (mockup), a transcript drop zone, and a one-tap submit that silently
 * attaches the CARIA report and posts the application as multipart/form-data.
 */
"use client";

import { useRef, useState } from "react";
import {
  Rocket,
  UploadCloud,
  FileText,
  FileDown,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Gauge,
  ExternalLink,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CariaDownloadButton from "@/components/dashboard/CariaDownloadButton";
import ApplicationFormSheet from "@/components/dashboard/ApplicationFormSheet";
import { useCariaReport } from "@/hooks/use-caria-report";
import { useLanguage } from "@/components/language-provider";
import { api, type FastTrackApplyResult } from "@/lib/api";
import { elementToPdfBlob, downloadBlob } from "@/lib/caria-report";
import { showToast } from "@/lib/utils";
import type { CareerResult } from "@/types";
import { getTrackForCareer, getTrackReadiness, getMes } from "@/lib/sut-tracks";

type SubmitStatus = "idle" | "generating" | "uploading" | "success" | "error";

const MAX_FILE_MB = 15;

const HELPFUL_LINKS = [
  {
    th: "ดูรายละเอียดหลักสูตร",
    en: "View program details",
    href: "https://digitech.sut.ac.th/apply-bachelor",
  },
  {
    th: "ระบบรับสมัคร SUT",
    en: "SUT admissions portal",
    href: "https://sutgateway.sut.ac.th/admissions2021/",
  },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NextSteps({
  careers,
  userId,
}: {
  careers: CareerResult[];
  userId: string;
}) {
  const { lang } = useLanguage();
  const thai = lang === "th";

  const { ready, capture, sheet, top } = useCariaReport(careers, userId);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [result, setResult] = useState<FastTrackApplyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formDownloading, setFormDownloading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const busy = status === "generating" || status === "uploading";

  const track = top ? getTrackForCareer(top) : null;
  const mes = top ? getMes(top) : 0;
  const readiness = getTrackReadiness(mes);

  if (!top || !track) return null;

  function handleOpenChange(next: boolean) {
    if (busy) return;
    setOpen(next);
    if (next) {
      setStatus("idle");
      setFile(null);
      setResult(null);
      setErrorMsg(null);
    }
  }

  function acceptFile(f: File | undefined | null) {
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrorMsg(thai ? "รองรับเฉพาะไฟล์ PDF เท่านั้น" : "Only PDF files are supported.");
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setErrorMsg(thai ? `ไฟล์ใหญ่เกิน ${MAX_FILE_MB} MB` : `File exceeds the ${MAX_FILE_MB} MB limit.`);
      return;
    }
    setErrorMsg(null);
    setFile(f);
  }

  async function handleDownloadForm() {
    if (!formRef.current || formDownloading) return;
    try {
      setFormDownloading(true);
      const blob = await elementToPdfBlob(formRef.current);
      downloadBlob(blob, "SUT_Digitech_Application_Form.pdf");
      showToast(thai ? "ดาวน์โหลดแบบฟอร์มแล้ว" : "Form downloaded", "success");
    } catch (err) {
      console.error("Application form download failed", err);
      showToast(thai ? "ดาวน์โหลดไม่สำเร็จ" : "Download failed", "error");
    } finally {
      setFormDownloading(false);
    }
  }

  async function handleSubmit() {
    if (!ready) {
      setErrorMsg(thai ? "กำลังเตรียมรายงาน กรุณาลองอีกครั้ง" : "Report is still preparing, please try again.");
      return;
    }
    try {
      setErrorMsg(null);
      setStatus("generating");
      const reportBlob = await capture();

      setStatus("uploading");
      const form = new FormData();
      form.append(
        "payload",
        JSON.stringify({ user_id: userId, mes_score: mes, target_track: track!.labelEn })
      );
      form.append("caria_report", reportBlob, `CARIA_Competency_Report_${userId}.pdf`);
      if (file) form.append("transcript", file, file.name);

      const res = await api.applyFastTrack(form);
      setResult(res);
      setStatus("success");
      showToast(thai ? "ส่งใบสมัคร Fast-Track สำเร็จ" : "Fast-Track application submitted", "success");
    } catch (err) {
      console.error("Fast-Track submission failed", err);
      setErrorMsg(
        thai
          ? "เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง"
          : "Something went wrong while submitting. Please try again."
      );
      setStatus("error");
    }
  }

  const submitLabel =
    status === "generating"
      ? thai
        ? "กำลังแนบผลประเมิน CARIA..."
        : "Attaching CARIA report..."
      : status === "uploading"
        ? thai
          ? "กำลังส่งใบสมัคร..."
          : "Submitting..."
        : thai
          ? "ยืนยันการส่งใบสมัคร"
          : "Submit application";

  return (
    <>
      {/* ───────────────────────── Next Steps section ───────────────────────── */}
      <section className="mt-12">
        <div className="rounded-3xl border border-border/70 bg-card/40 p-6 backdrop-blur-sm md:p-8 dark:bg-white/2">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-orange">
                <Sparkles className="size-3" strokeWidth={2.5} aria-hidden />
                {thai ? "Your Next Step" : "Your Next Step"}
              </div>
              <h2 className="font-syne text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl dark:text-white text-balance">
                {thai ? "ก้าวต่อไปของคุณสู่เส้นทางสายดิจิทัล" : "Your next step into a digital career"}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {thai
                  ? "ดาวน์โหลดผลประเมิน CARIA เก็บไว้ใช้งานได้ทุกเมื่อ หรือยื่นพอร์ต Fast-Track เข้าศึกษาต่อ โดยระบบจะแนบผลประเมินให้อัตโนมัติ"
                  : "Download your CARIA report to keep, or submit a Fast-Track application; your report is attached automatically."}
              </p>

              {/* Target context */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: `${track.accent}1a`, color: track.accent }}
                >
                  <track.Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
                  {thai ? track.labelTh : track.labelEn}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: `${readiness.color}1f`, color: readiness.color }}
                >
                  <Gauge className="size-3.5" strokeWidth={2.5} aria-hidden />
                  {mes} MES · {thai ? readiness.labelTh : readiness.labelEn}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <CariaDownloadButton
                capture={capture}
                ready={ready}
                userId={userId}
                variant="secondary"
                className="w-full sm:w-auto"
              />

              <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <button className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-orange px-6 text-sm font-bold text-brand-orange-foreground shadow-[0_12px_32px_-12px_rgba(243,146,0,0.8)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_16px_40px_-12px_rgba(243,146,0,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:w-auto">
                    <Rocket
                      className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:rotate-0"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    {thai ? "ยื่นพอร์ต Fast-Track เข้า Digitech SUT" : "Submit Fast-Track to Digitech SUT"}
                  </button>
                </DialogTrigger>

                <DialogContent
                  showCloseButton={!busy}
                  onInteractOutside={(e) => busy && e.preventDefault()}
                  onEscapeKeyDown={(e) => busy && e.preventDefault()}
                  className="font-thai max-h-[90vh] gap-0 overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[580px]"
                >
                  {status === "success" && result ? (
                    /* ───────────── Success ───────────── */
                    <div className="flex flex-col items-center px-7 py-10 text-center">
                      <div className="animate-in zoom-in-50 duration-300 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                        <CheckCircle2 className="size-9" strokeWidth={2} aria-hidden />
                      </div>
                      <DialogTitle className="mt-5 font-syne text-2xl font-bold text-slate-900 dark:text-white">
                        {thai ? "ส่งใบสมัครสำเร็จ" : "Application submitted"}
                      </DialogTitle>
                      <DialogDescription className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {result.message}
                      </DialogDescription>
                      <div className="mt-5 flex flex-col items-center gap-1 rounded-xl border border-border/70 bg-muted/40 px-5 py-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {thai ? "รหัสใบสมัคร" : "Reference ID"}
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {result.lead_id}
                        </span>
                      </div>
                      <DialogClose asChild>
                        <button className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-brand-orange px-5 py-3 text-sm font-bold text-brand-orange-foreground transition-all hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                          {thai ? "เสร็จสิ้น" : "Done"}
                        </button>
                      </DialogClose>
                    </div>
                  ) : (
                    /* ───────────── Form ───────────── */
                    <>
                      <DialogHeader className="sticky top-0 z-10 space-y-0 border-b border-border/70 bg-background px-7 pt-7 pb-5 text-left">
                        <div className="flex items-start gap-3.5">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <Rocket className="size-5" strokeWidth={2.25} aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <DialogTitle className="font-syne text-lg font-bold leading-snug tracking-tight text-slate-900 dark:text-white text-balance">
                              {thai
                                ? "ยื่นใบสมัครเข้าศึกษาต่อ สำนักวิชาศาสตร์และศิลป์ดิจิทัล (SUT)"
                                : "Apply to the School of Digital Science and Arts (SUT)"}
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                              {thai
                                ? "มหาวิทยาลัยเทคโนโลยีสุรนารี (Digitech SUT)"
                                : "Suranaree University of Technology (Digitech SUT)"}
                            </DialogDescription>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold"
                            style={{ background: `${track.accent}1a`, color: track.accent }}
                          >
                            <track.Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
                            {thai ? track.labelTh : track.labelEn}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold"
                            style={{ background: `${readiness.color}1f`, color: readiness.color }}
                          >
                            <Gauge className="size-3.5" strokeWidth={2.5} aria-hidden />
                            {mes} MES
                          </span>
                        </div>
                      </DialogHeader>

                      <div className="space-y-6 px-7 py-6">
                        {/* Resources: links + mockup form */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {thai ? "ข้อมูลและเอกสาร" : "Resources"}
                          </p>
                          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {HELPFUL_LINKS.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-brand-orange/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/5 dark:text-slate-100"
                              >
                                <span className="truncate">{thai ? link.th : link.en}</span>
                                <ExternalLink
                                  className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand-orange"
                                  strokeWidth={2.25}
                                  aria-hidden
                                />
                              </a>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleDownloadForm}
                            disabled={formDownloading}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent px-4 text-sm font-semibold text-foreground transition-colors hover:border-brand-orange/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                          >
                            {formDownloading ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden />
                            ) : (
                              <FileDown className="size-4" strokeWidth={2.25} aria-hidden />
                            )}
                            {thai ? "ดาวน์โหลดแบบฟอร์มใบสมัคร (Mockup PDF)" : "Download application form (mockup PDF)"}
                          </button>
                        </div>

                        {/* Attachments */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {thai ? "แนบเอกสาร" : "Attachments"}
                          </p>

                          {file ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/40 px-4 py-3.5">
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-orange/15 text-brand-orange">
                                <FileText className="size-5" strokeWidth={2} aria-hidden />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground tabular-nums">{formatBytes(file.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFile(null)}
                                disabled={busy}
                                aria-label={thai ? "ลบไฟล์" : "Remove file"}
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                              >
                                <X className="size-4" strokeWidth={2.5} aria-hidden />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                                acceptFile(e.dataTransfer.files?.[0]);
                              }}
                              className={`flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                dragActive
                                  ? "border-brand-orange bg-brand-orange/10"
                                  : "border-border bg-muted/30 hover:border-brand-orange/50 hover:bg-muted/50"
                              }`}
                            >
                              <span
                                className={`flex size-12 items-center justify-center rounded-xl transition-colors ${
                                  dragActive ? "bg-brand-orange/20 text-brand-orange" : "bg-brand-orange/10 text-brand-orange"
                                }`}
                              >
                                <UploadCloud className="size-6" strokeWidth={1.75} aria-hidden />
                              </span>
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {thai ? "แนบใบสมัครและ Portfolio" : "Attach application & portfolio"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {thai ? `ลากมาวางหรือคลิกเพื่อเลือก · ไม่เกิน ${MAX_FILE_MB} MB` : `Drag & drop or click · up to ${MAX_FILE_MB} MB`}
                              </span>
                            </button>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            className="sr-only"
                            onChange={(e) => acceptFile(e.target.files?.[0])}
                          />

                          {/* Validation note */}
                          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3.5">
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" strokeWidth={2.25} aria-hidden />
                            <p className="text-[13px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                              {thai
                                ? "ระบบจะทำการแนบ CARIA Competency Report ของคุณส่งตรงให้คณะโดยอัตโนมัติ"
                                : "Your CARIA Competency Report will be sent directly to the school automatically."}
                            </p>
                          </div>

                          {errorMsg && (
                            <div
                              role="alert"
                              className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] font-medium text-destructive"
                            >
                              <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                              <span>{errorMsg}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="sticky bottom-0 flex flex-col-reverse gap-2.5 border-t border-border/70 bg-background px-7 py-5 sm:flex-row sm:justify-end">
                        <DialogClose asChild>
                          <button
                            type="button"
                            disabled={busy}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-transparent px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                          >
                            {thai ? "ยกเลิก" : "Cancel"}
                          </button>
                        </DialogClose>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={busy || !ready}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 text-sm font-bold text-brand-orange-foreground shadow-md transition-all hover:scale-[1.01] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                          {busy ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <Send className="size-4" strokeWidth={2.25} aria-hidden />
                          )}
                          {!ready && !busy ? (thai ? "กำลังเตรียม..." : "Preparing...") : submitLabel}
                        </button>
                      </div>

                      {/* Off-screen mockup form (mounted while the modal is open) */}
                      <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0 z-[-1]">
                        <ApplicationFormSheet
                          ref={formRef}
                          trackLabel={thai ? track.labelTh : track.labelEn}
                          userId={userId}
                        />
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Off-screen CARIA report (shared by download + modal submit) */}
      {sheet}
    </>
  );
}
