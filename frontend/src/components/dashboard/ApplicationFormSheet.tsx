/**
 * ApplicationFormSheet — printable blank admission form (mockup).
 *
 * Rendered off-screen and captured to a PDF the applicant can download, print,
 * and fill by hand. Rendered as HTML (not raw jsPDF text) so Thai glyphs shape
 * correctly. A4-proportioned, light/hex-only for a deterministic capture.
 */
"use client";

import { forwardRef } from "react";
import { useLanguage } from "@/components/language-provider";

/** A labeled, hand-fillable line. */
function FormField({ label, en, grow = 1 }: { label: string; en?: string; grow?: number }) {
  return (
    <div style={{ flex: grow }} className="min-w-0">
      <div className="flex items-end gap-2">
        <span className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-slate-700">
          {label}
        </span>
        <span className="h-5 flex-1 border-b border-dotted border-slate-300" />
      </div>
      {en && <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-wide text-slate-400">{en}</span>}
    </div>
  );
}

function SectionTitle({ n, th, en }: { n: number; th: string; en: string }) {
  return (
    <div className="mt-5 mb-3 flex items-center gap-2.5">
      <span className="flex size-5 items-center justify-center rounded-md bg-[#002F6C] text-[11px] font-bold text-white">
        {n}
      </span>
      <span className="text-[13px] font-bold text-slate-900">{th}</span>
      <span className="text-[11px] font-medium text-slate-400">{en}</span>
    </div>
  );
}

interface ApplicationFormSheetProps {
  trackLabel?: string;
  userId?: string;
}

const ApplicationFormSheet = forwardRef<HTMLDivElement, ApplicationFormSheetProps>(
  function ApplicationFormSheet({ trackLabel, userId }, ref) {
    const { lang } = useLanguage();
    const thai = lang === "th";

    return (
      <div
        ref={ref}
        className="font-thai flex flex-col bg-white text-slate-900"
        style={{ width: 794, minHeight: 1123, padding: 56 }}
      >
        {/* Masthead */}
        <header className="flex items-center gap-4 border-b-2 border-[#002F6C] pb-5">
          <div
            className="flex size-14 items-center justify-center rounded-xl text-xl font-black text-[#1a1100]"
            style={{ background: "#F39200" }}
          >
            SUT
          </div>
          <div className="min-w-0">
            <p className="font-syne text-lg font-extrabold leading-tight text-slate-900">
              มหาวิทยาลัยเทคโนโลยีสุรนารี
            </p>
            <p className="text-[12px] font-semibold text-slate-600">
              สำนักวิชาศาสตร์และศิลป์ดิจิทัล · School of Digital Science and Arts
            </p>
          </div>
        </header>

        <div className="mt-5 text-center">
          <h1 className="font-syne text-xl font-bold text-slate-900">
            ใบสมัครเข้าศึกษาต่อระดับปริญญาตรี (รอบ Fast-Track)
          </h1>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Undergraduate Fast-Track Application Form
          </p>
        </div>

        {/* 1. Applicant */}
        <SectionTitle n={1} th="ข้อมูลผู้สมัคร" en="Applicant Information" />
        <div className="flex flex-col gap-4">
          <div className="flex gap-6">
            <FormField label="คำนำหน้า" en="Title" grow={1} />
            <FormField label="ชื่อ-นามสกุล" en="Full name" grow={3} />
          </div>
          <div className="flex gap-6">
            <FormField label="เลขประจำตัวประชาชน" en="National ID" grow={2} />
            <FormField label="วัน/เดือน/ปีเกิด" en="Date of birth" grow={1.4} />
          </div>
        </div>

        {/* 2. Contact */}
        <SectionTitle n={2} th="ข้อมูลติดต่อ" en="Contact" />
        <div className="flex flex-col gap-4">
          <FormField label="ที่อยู่ปัจจุบัน" en="Current address" />
          <div className="flex gap-6">
            <FormField label="โทรศัพท์" en="Phone" grow={1} />
            <FormField label="อีเมล" en="Email" grow={1.6} />
          </div>
        </div>

        {/* 3. Education */}
        <SectionTitle n={3} th="ประวัติการศึกษา" en="Education Background" />
        <div className="flex flex-col gap-4">
          <FormField label="สถาบันเดิม" en="Previous institution" />
          <div className="flex gap-6">
            <FormField label="วุฒิการศึกษา" en="Qualification" grow={1.4} />
            <FormField label="GPAX" en="GPA" grow={0.7} />
            <FormField label="ปีที่สำเร็จ" en="Year completed" grow={1} />
          </div>
        </div>

        {/* 4. Program */}
        <SectionTitle n={4} th="สาขาที่สมัคร" en="Program Applied" />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          {trackLabel ? (
            <p className="text-[12px] text-slate-600">
              สายหลักสูตรที่ระบบแนะนำจากผลประเมิน:{" "}
              <span className="font-bold text-slate-900">{trackLabel}</span>
            </p>
          ) : null}
          <div className="mt-2">
            <FormField label="ระบุสาขา/หลักสูตรที่ต้องการสมัคร" en="Intended program" />
          </div>
        </div>

        {/* Attachments */}
        <SectionTitle n={5} th="เอกสารแนบ" en="Attachments" />
        <ul className="flex flex-col gap-2 text-[12px] text-slate-700">
          {[
            { th: "ผลประเมิน CARIA Competency Score (แนบอัตโนมัติจากระบบ)", checked: true },
            { th: "Transcript / ใบแสดงผลการเรียน", checked: false },
            { th: "สำเนาบัตรประชาชน", checked: false },
            { th: "แฟ้มสะสมผลงาน (ถ้ามี)", checked: false },
          ].map((doc) => (
            <li key={doc.th} className="flex items-center gap-2.5">
              <span
                className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px] font-bold"
                style={
                  doc.checked
                    ? { background: "#16a34a", borderColor: "#16a34a", color: "#ffffff" }
                    : { borderColor: "#cbd5e1", color: "transparent" }
                }
              >
                ✓
              </span>
              <span className={doc.checked ? "font-semibold text-slate-800" : ""}>{doc.th}</span>
            </li>
          ))}
        </ul>

        {/* Signature */}
        <div className="mt-8 flex items-end justify-between gap-10">
          <FormField label="ลงชื่อผู้สมัคร" en="Applicant signature" grow={1.4} />
          <FormField label="วันที่" en="Date" grow={1} />
        </div>

        {/* Footer */}
        <footer className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-[10px] text-slate-400">
            แบบฟอร์มตัวอย่าง (Mockup) · CARIA-FT-FORM {userId ? `· ${userId}` : ""}
          </span>
          <span className="text-[10px] text-slate-400">digitech.sut.ac.th</span>
        </footer>
      </div>
    );
  }
);

export default ApplicationFormSheet;
