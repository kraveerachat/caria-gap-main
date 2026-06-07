"use client";

import { useEffect, useMemo, useState } from "react";
import type { CareerResult, CompetencyScores } from "@/types";
import {
  rankCareers,
  analyzeDreamCareer,
  demoStudentScores,
  type DreamCareerAnalysis,
} from "@/lib/gap-analysis";

export interface GapAnalysis {
  /** True once localStorage has been read on the client. */
  ready: boolean;
  /** False when there is neither a real assessment nor a demo context. */
  hasData: boolean;
  scores: CompetencyScores | null;
  /** All 78 careers ranked by MES (highest match first). */
  careers: CareerResult[];
  /** Rank 1–4 only (the focused dashboard). */
  top4: CareerResult[];
  dream: DreamCareerAnalysis | null;
  dreamId: string;
}

function readDreamId(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("user_dream_career") || localStorage.getItem("dreamCareer");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id as string;
    }
  } catch {
    /* corrupt entry — fall through */
  }
  return localStorage.getItem("caria_dream_career_id") || "";
}

function readScores(): CompetencyScores | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user_custom_scores");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        return parsed as CompetencyScores;
      }
    }
  } catch {
    /* corrupt entry — fall through */
  }
  return null;
}

/**
 * Reads the student's competency scores from localStorage, ranks all careers
 * client-side via the MES engine, and derives the dream-career match + gaps.
 * Falls back to a demo profile for the "Skip to dashboard" path.
 */
export function useGapAnalysis(userId: string): GapAnalysis {
  const [scores, setScores] = useState<CompetencyScores | null>(null);
  const [dreamId, setDreamId] = useState("");
  const [ready, setReady] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const real = readScores();
    const dId = readDreamId();
    setDreamId(dId);
    if (real) {
      setScores(real);
      setHasData(true);
    } else if (dId || userId.startsWith("demo")) {
      setScores(demoStudentScores());
      setHasData(true);
    } else {
      setHasData(false);
    }
    setReady(true);
  }, [userId]);

  const careers = useMemo(() => (scores ? rankCareers(scores) : []), [scores]);
  const top4 = useMemo(() => careers.slice(0, 4), [careers]);
  const dream = useMemo(
    () => (scores && dreamId ? analyzeDreamCareer(scores, careers, dreamId) : null),
    [scores, careers, dreamId],
  );

  // Persist a backward-compatible result so the Profile page keeps working.
  useEffect(() => {
    if (typeof window === "undefined" || careers.length === 0) return;
    try {
      localStorage.setItem(
        "caria_last_result",
        JSON.stringify({
          assessment_id: `ASM_${userId}`,
          user_id: userId,
          timestamp: new Date().toISOString(),
          top10_careers: careers.slice(0, 10),
          dream_career_id: dreamId || undefined,
        }),
      );
    } catch {
      /* storage full / unavailable — non-critical */
    }
  }, [careers, dreamId, userId]);

  return { ready, hasData, scores, careers, top4, dream, dreamId };
}
