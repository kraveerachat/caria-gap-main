/**
 * Client-side gap analysis + career ranking.
 *
 * The "heart of the research": the user's competency scores (averaged from the
 * 81 quiz answers) are matched against every career's required competency vector
 * using the Modified Euclidean Similarity already implemented and unit-tested in
 * `mes-client.ts` (Eq.1 capping + Eq.2 MES). No backend is involved; the career
 * requirement vectors ship in `career-vectors.json`.
 *
 * Taxonomy note: the quiz emits its own K## knowledge numbering, while the
 * career vectors and `competencies.json` use the canonical career taxonomy.
 * We align the student's scores onto the career space by semantic name and run
 * the Euclidean distance over the 60 shared dimensions (all 31 skills + 6
 * attitudes + the 23 knowledge areas both sides define). Non-shared dimensions
 * (e.g. Mechanical, Biology) are not comparable and are excluded.
 */

import careerVectors from "./career-vectors.json";
import { recomputeRanking } from "./mes-client";
import { COMPETENCIES, competencyDomain, competencyLabel, DOMAIN_META, type CompetencyDomain } from "./competencies";
import { ASSESSMENT_QUESTIONS } from "./questions";
import type { CareerResult, CareerVector, CompetencyScores, RadarData, RadarSeries } from "@/types";

export const CAREER_VECTORS = careerVectors as CareerVector[];

const META = new Map(CAREER_VECTORS.map((c) => [c.career_id, c]));
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/* ---- competency-space alignment --------------------------------------- */

const norm = (key: string) => key.replace(/^[SKA]\d+_/, "");

// Career-space keys (competencies.json + vectors) indexed by semantic name.
const CAREER_NAME_TO_KEY = new Map(COMPETENCIES.map((c) => [norm(c.id), c.id]));

// Career keys the quiz actually measures = the comparable dimensions.
const QUIZ_NAMES = new Set(ASSESSMENT_QUESTIONS.map((q) => norm(q.competencyId)));
const SHARED_KEYS = COMPETENCIES.map((c) => c.id).filter((id) => QUIZ_NAMES.has(norm(id)));

// Career vectors restricted to the shared dimensions, for the MES math.
const ALIGNED_VECTORS: CareerVector[] = CAREER_VECTORS.map((c) => {
  const v: CompetencyScores = {};
  for (const key of SHARED_KEYS) if (key in c.competency_vector) v[key] = c.competency_vector[key];
  return { ...c, competency_vector: v };
});
const ALIGNED = new Map(ALIGNED_VECTORS.map((c) => [c.career_id, c]));

/** Remap quiz-keyed student scores onto the shared career competency space. */
export function alignStudentScores(quizScores: CompetencyScores): CompetencyScores {
  const out: CompetencyScores = {};
  for (const [quizKey, value] of Object.entries(quizScores)) {
    const careerKey = CAREER_NAME_TO_KEY.get(norm(quizKey));
    if (careerKey && QUIZ_NAMES.has(norm(careerKey))) out[careerKey] = value;
  }
  return out;
}

/* ---- types ------------------------------------------------------------ */

export interface SkillGap {
  competency_id: string;
  domain: string;
  student_score: number;
  career_required: number;
  /** Positive magnitude: how far below (gap) or above (strength) the requirement. */
  gap: number;
}

export interface DreamCareerAnalysis {
  career: CareerVector;
  match_percentage: number;
  raw_mes: number;
  rank: number;
  totalCareers: number;
  gaps: SkillGap[];
  strengths: SkillGap[];
}

/** Split a career's requirements into the student's gaps (below) and strengths (at/above). */
function splitGaps(scores: CompetencyScores, vector: CompetencyScores) {
  const gaps: SkillGap[] = [];
  const strengths: SkillGap[] = [];
  for (const key of Object.keys(vector)) {
    const required = vector[key];
    const student = scores[key] ?? 0;
    const diff = required - student;
    const base = {
      competency_id: key,
      domain: competencyDomain(key) ?? "skill",
      student_score: student,
      career_required: required,
    };
    if (diff > 0) gaps.push({ ...base, gap: diff });
    else strengths.push({ ...base, gap: -diff });
  }
  gaps.sort((a, b) => b.gap - a.gap);
  strengths.sort((a, b) => b.gap - a.gap);
  return { gaps, strengths };
}

/* ---- public API ------------------------------------------------------- */

/**
 * Rank all 78 careers by Modified Euclidean Similarity and shape each into the
 * `CareerResult` the dashboard cards (and the legacy Profile page) expect.
 * Accepts raw quiz-space scores; alignment is handled internally.
 */
export function rankCareers(quizScores: CompetencyScores): CareerResult[] {
  const scores = alignStudentScores(quizScores);
  return recomputeRanking(scores, ALIGNED_VECTORS).map((r) => {
    const meta = META.get(r.career_id)!;
    const { gaps, strengths } = splitGaps(scores, ALIGNED.get(r.career_id)!.competency_vector);
    return {
      rank: r.rank,
      career_id: r.career_id,
      career_name: r.career_name,
      career_group: meta.career_group,
      program: meta.program,
      match_percentage: r.match_percentage,
      raw_mes: r.raw_mes,
      top_strengths: strengths.slice(0, 3).map((s) => s.competency_id),
      top_gaps: gaps.slice(0, 3).map((g) => g.competency_id),
    };
  });
}

/** Detailed match + gap breakdown for the chosen dream career. */
export function analyzeDreamCareer(
  quizScores: CompetencyScores,
  ranked: CareerResult[],
  dreamId: string,
): DreamCareerAnalysis | null {
  const aligned = ALIGNED.get(dreamId);
  const meta = META.get(dreamId);
  if (!aligned || !meta) return null;
  const scores = alignStudentScores(quizScores);
  const entry = ranked.find((r) => r.career_id === dreamId);
  const { gaps, strengths } = splitGaps(scores, aligned.competency_vector);
  return {
    career: meta,
    match_percentage: entry?.match_percentage ?? 0,
    raw_mes: entry?.raw_mes ?? 0,
    rank: entry?.rank ?? 0,
    totalCareers: ranked.length,
    gaps,
    strengths,
  };
}

/**
 * Build the drill-down radar payload for one career, entirely client-side.
 *
 * Produces the same `RadarData` shape the backend `/gap-analysis` endpoint used
 * (so `DrilldownRadar` drops in unchanged) but computes it from the student's
 * scores + the bundled career vectors: no network, no next-auth, no async. Each
 * domain shows the role's most-demanded competencies (capped for legibility),
 * overlaid with the student's aligned scores, plus a 3-axis domain summary.
 */
export function buildRadarData(
  quizScores: CompetencyScores,
  careerId: string,
  thai = false,
  perDomain = 8,
): RadarData {
  const emptySeries = (): RadarSeries => ({ labels: [], student_scores: [], career_scores: [] });
  const radar: RadarData = {
    summary_3axis: { labels: [], student_averages: [], career_averages: [] },
    drilldown_skills: emptySeries(),
    drilldown_attitudes: emptySeries(),
    drilldown_knowledge: emptySeries(),
  };

  const aligned = ALIGNED.get(careerId);
  if (!aligned) return radar;

  const scores = alignStudentScores(quizScores);
  const vector = aligned.competency_vector;

  const seriesByDomain: Record<CompetencyDomain, RadarSeries> = {
    skill: radar.drilldown_skills,
    knowledge: radar.drilldown_knowledge,
    attitude: radar.drilldown_attitudes,
  };
  const buckets: Record<CompetencyDomain, string[]> = { skill: [], knowledge: [], attitude: [] };
  for (const key of Object.keys(vector)) {
    const domain = competencyDomain(key);
    if (domain) buckets[domain].push(key);
  }

  const mean = (ns: number[]) => (ns.length ? clamp(ns.reduce((s, n) => s + n, 0) / ns.length) : 0);

  (Object.keys(buckets) as CompetencyDomain[]).forEach((domain) => {
    const keys = buckets[domain];
    if (keys.length === 0) return;

    // Whole-domain averages feed the 3-axis summary.
    radar.summary_3axis.labels.push(thai ? DOMAIN_META[domain].labelTh : DOMAIN_META[domain].labelEn);
    radar.summary_3axis.student_averages.push(mean(keys.map((k) => clamp(scores[k] ?? 0))));
    radar.summary_3axis.career_averages.push(mean(keys.map((k) => clamp(vector[k]))));

    // The radar itself shows the role's most-demanded competencies for legibility.
    const top = [...keys].sort((a, b) => vector[b] - vector[a]).slice(0, perDomain);
    const series = seriesByDomain[domain];
    for (const key of top) {
      series.labels.push(competencyLabel(key, thai));
      series.student_scores.push(clamp(scores[key] ?? 0));
      series.career_scores.push(clamp(vector[key]));
    }
  });

  return radar;
}

/**
 * Deterministic developer-leaning student profile (career-space) for the demo /
 * "Skip to dashboard" path, so the client-side engine always has real input to
 * rank. Mirrors the "ต้น" persona (strong programming, weak negotiation/sales).
 */
export function demoStudentScores(): CompetencyScores {
  const scores: CompetencyScores = {};
  const dev = ALIGNED.get("DT08")?.competency_vector ?? {};
  for (const key of SHARED_KEYS) scores[key] = clamp((dev[key] ?? 45) - 12);
  const boosts: Record<string, number> = {
    Programming: 92,
    Complex_Problem_Solving: 86,
    Critical_Thinking: 82,
    Troubleshooting: 80,
    Negotiation: 28,
    Sales_and_Marketing: 30,
    Persuasion: 35,
  };
  for (const [name, value] of Object.entries(boosts)) {
    const key = CAREER_NAME_TO_KEY.get(name);
    if (key && key in scores) scores[key] = value;
  }
  return scores;
}
