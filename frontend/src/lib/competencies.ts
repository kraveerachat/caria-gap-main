/**
 * The 66 CARIA competency definitions (Skills / Knowledge / Attitudes), loaded
 * from the research dataset (mirrors backend/data/competencies.json). Used by the
 * What-If Simulator to bind sliders to real competency ids (e.g. S20_Programming,
 * K05_Computers_and_Electronics) and by anything that needs a human label.
 */
import data from "./competencies.json";
import { Wrench, BookOpen, Compass, type LucideIcon } from "lucide-react";

export type CompetencyDomain = "skill" | "knowledge" | "attitude";

export interface Competency {
  id: string;
  domain: CompetencyDomain;
  label_en: string;
  label_th: string;
}

export const COMPETENCIES = data as Competency[];

export const DOMAIN_META: Record<
  CompetencyDomain,
  { labelEn: string; labelTh: string; Icon: LucideIcon; color: string }
> = {
  skill: { labelEn: "Skills", labelTh: "ทักษะ", Icon: Wrench, color: "#F39200" },
  knowledge: { labelEn: "Knowledge", labelTh: "ความรู้", Icon: BookOpen, color: "#1E90FF" },
  attitude: { labelEn: "Attitudes", labelTh: "ทัศนคติ", Icon: Compass, color: "#A78BFA" },
};

const LABEL_BY_ID: Record<string, Competency> = Object.fromEntries(
  COMPETENCIES.map((c) => [c.id, c]),
);

/** Human label for a competency id, falling back to a de-prefixed id. */
export function competencyLabel(id: string, thai: boolean): string {
  const c = LABEL_BY_ID[id];
  if (c) return thai ? c.label_th : c.label_en;
  return id.replace(/^[ASK]\d{2}_/, "").replace(/_/g, " ");
}

export function competencyDomain(id: string): CompetencyDomain | null {
  return LABEL_BY_ID[id]?.domain ?? null;
}
