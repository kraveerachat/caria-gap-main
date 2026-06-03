/**
 * useCariaReport — shared owner of the off-screen CARIA Competency Report.
 *
 * Fetches the gap-analysis radar for the student's top matched career, mounts a
 * single off-screen CariaReportSheet, and exposes `capture()` returning a PDF
 * blob. Both the "Download CARIA report" action and the Fast-Track modal's
 * silent attach use the same capture, so the report is generated one way only.
 *
 * The caller MUST render the returned `sheet` element so the report is in the
 * DOM and painted before `capture()` runs.
 */
"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import CariaReportSheet from "@/components/dashboard/CariaReportSheet";
import { api } from "@/lib/api";
import { elementToPdfBlob } from "@/lib/caria-report";
import type { CareerResult, RadarData } from "@/types";

export function useCariaReport(careers: CareerResult[], userId: string) {
  const top = careers[0] as CareerResult | undefined;
  const [radar, setRadar] = useState<RadarData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!top) return;
    let active = true;
    api
      .getGapAnalysis(userId, top.career_id)
      .then((res) => {
        if (active) setRadar(res.radar_data);
      })
      .catch(() => {
        /* api layer already falls back to mock radar data when offline */
      });
    return () => {
      active = false;
    };
  }, [top?.career_id, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = !!radar && !!top;

  const capture = useCallback(async (): Promise<Blob> => {
    if (!reportRef.current) {
      throw new Error("CARIA report is not ready yet");
    }
    return elementToPdfBlob(reportRef.current);
  }, []);

  const sheet: ReactNode =
    ready && top ? (
      <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0 z-[-1]">
        <CariaReportSheet ref={reportRef} career={top} radar={radar as RadarData} userId={userId} />
      </div>
    ) : null;

  return { ready, capture, sheet, top };
}
