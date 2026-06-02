/**
 * SUT Curriculum Track mapping — the lead-generation funnel layer.
 *
 * Maps each recommended career (by competency group / program) to a high-level
 * SUT Digitech curriculum track, derives a Track Readiness tier from the MES
 * score, and surfaces faculty-level upskill programs (bootcamps / certificates)
 * rather than individual course codes. The goal is to route a matched student
 * directly to the SUT program that owns that career path.
 */
import {
  Database,
  Code2,
  MonitorSmartphone,
  Smartphone,
  Cloud,
  FolderTree,
  Clapperboard,
  Megaphone,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export type UpskillFormat = "Bootcamp" | "Certificate" | "Workshop";

export interface UpskillProgram {
  nameEn: string;
  nameTh: string;
  format: UpskillFormat;
  weeks: number;
}

export interface SutTrack {
  id: string;
  labelEn: string;
  labelTh: string;
  blurbEn: string;
  blurbTh: string;
  Icon: LucideIcon;
  /** Single accent hex, used sparingly per the product register. */
  accent: string;
  /** Lowercased substrings matched against a career's `career_group`. */
  groupMatchers: string[];
  /** Faculty-level upskill offers (no individual course codes). */
  programs: UpskillProgram[];
}

export const SUT_TRACKS: SutTrack[] = [
  {
    id: "data-science-ai",
    labelEn: "Data Science & AI",
    labelTh: "วิทยาการข้อมูลและ AI",
    blurbEn: "Statistics, machine learning, and data engineering for analytics roles.",
    blurbTh: "สถิติ แมชชีนเลิร์นนิง และวิศวกรรมข้อมูลสำหรับสายวิเคราะห์ข้อมูล",
    Icon: Database,
    accent: "#2563EB",
    groupMatchers: ["data science"],
    programs: [
      { nameEn: "Data Science & AI Bootcamp", nameTh: "บูทแคมป์วิทยาการข้อมูลและ AI", format: "Bootcamp", weeks: 16 },
      { nameEn: "Applied Machine Learning Certificate", nameTh: "ประกาศนียบัตรแมชชีนเลิร์นนิงประยุกต์", format: "Certificate", weeks: 8 },
    ],
  },
  {
    id: "software-engineering",
    labelEn: "Software Engineering",
    labelTh: "วิศวกรรมซอฟต์แวร์",
    blurbEn: "System design, programming, and engineering practice for product teams.",
    blurbTh: "การออกแบบระบบ การเขียนโปรแกรม และกระบวนการวิศวกรรมสำหรับทีมผลิตภัณฑ์",
    Icon: Code2,
    accent: "#F39200",
    groupMatchers: ["enterprise software"],
    programs: [
      { nameEn: "Full-Stack Engineering Bootcamp", nameTh: "บูทแคมป์วิศวกรรมซอฟต์แวร์ฟูลสแตก", format: "Bootcamp", weeks: 16 },
      { nameEn: "Software Quality & Testing Certificate", nameTh: "ประกาศนียบัตรการประกันคุณภาพซอฟต์แวร์", format: "Certificate", weeks: 6 },
    ],
  },
  {
    id: "web-ux",
    labelEn: "Web & UX Engineering",
    labelTh: "เว็บและประสบการณ์ผู้ใช้",
    blurbEn: "Front-end development paired with user-experience and interface design.",
    blurbTh: "การพัฒนาเว็บฝั่งหน้าบ้าน ควบคู่การออกแบบประสบการณ์และส่วนติดต่อผู้ใช้",
    Icon: MonitorSmartphone,
    accent: "#8B5CF6",
    groupMatchers: ["web application", "visual design"],
    programs: [
      { nameEn: "Modern Web Development Bootcamp", nameTh: "บูทแคมป์การพัฒนาเว็บสมัยใหม่", format: "Bootcamp", weeks: 12 },
      { nameEn: "UX/UI Design Certificate", nameTh: "ประกาศนียบัตรการออกแบบ UX/UI", format: "Certificate", weeks: 8 },
    ],
  },
  {
    id: "mobile-dev",
    labelEn: "Mobile App Development",
    labelTh: "การพัฒนาแอปมือถือ",
    blurbEn: "Cross-platform and native mobile application engineering.",
    blurbTh: "การพัฒนาแอปพลิเคชันมือถือทั้งข้ามแพลตฟอร์มและเนทีฟ",
    Icon: Smartphone,
    accent: "#10B981",
    groupMatchers: ["mobile application", "application"],
    programs: [
      { nameEn: "Cross-Platform Mobile Bootcamp", nameTh: "บูทแคมป์แอปมือถือข้ามแพลตฟอร์ม", format: "Bootcamp", weeks: 12 },
      { nameEn: "Native iOS & Android Certificate", nameTh: "ประกาศนียบัตรพัฒนาแอปเนทีฟ iOS และ Android", format: "Certificate", weeks: 8 },
    ],
  },
  {
    id: "cloud-security",
    labelEn: "Cloud & Cybersecurity",
    labelTh: "คลาวด์และความมั่นคงปลอดภัยไซเบอร์",
    blurbEn: "Network and cloud infrastructure with security operations.",
    blurbTh: "โครงสร้างพื้นฐานเครือข่ายและคลาวด์ พร้อมงานความมั่นคงปลอดภัย",
    Icon: Cloud,
    accent: "#0EA5E9",
    groupMatchers: ["cloud technology"],
    programs: [
      { nameEn: "Cloud Infrastructure Bootcamp", nameTh: "บูทแคมป์โครงสร้างพื้นฐานคลาวด์", format: "Bootcamp", weeks: 12 },
      { nameEn: "Cybersecurity Defense Certificate", nameTh: "ประกาศนียบัตรการป้องกันภัยไซเบอร์", format: "Certificate", weeks: 8 },
    ],
  },
  {
    id: "data-governance",
    labelEn: "Data Governance",
    labelTh: "ธรรมาภิบาลข้อมูล",
    blurbEn: "Information management, curation, and data stewardship.",
    blurbTh: "การจัดการสารสนเทศ การดูแลคุณภาพ และธรรมาภิบาลข้อมูล",
    Icon: FolderTree,
    accent: "#64748B",
    groupMatchers: ["data handling"],
    programs: [
      { nameEn: "Information Management Certificate", nameTh: "ประกาศนียบัตรการจัดการสารสนเทศ", format: "Certificate", weeks: 8 },
      { nameEn: "Data Stewardship Workshop", nameTh: "เวิร์กช็อปการดูแลธรรมาภิบาลข้อมูล", format: "Workshop", weeks: 4 },
    ],
  },
  {
    id: "creative-media",
    labelEn: "Creative & Visual Media",
    labelTh: "สื่อสร้างสรรค์และทัศนศิลป์",
    blurbEn: "Animation, film, game, and multimedia content production.",
    blurbTh: "การผลิตอนิเมชัน ภาพยนตร์ เกม และคอนเทนต์สื่อผสม",
    Icon: Clapperboard,
    accent: "#EC4899",
    groupMatchers: ["content creator", "animation", "film", "video", "game"],
    programs: [
      { nameEn: "Digital Media Production Bootcamp", nameTh: "บูทแคมป์การผลิตสื่อดิจิทัล", format: "Bootcamp", weeks: 12 },
      { nameEn: "Motion & Animation Certificate", nameTh: "ประกาศนียบัตรงานภาพเคลื่อนไหวและอนิเมชัน", format: "Certificate", weeks: 8 },
    ],
  },
  {
    id: "digital-marketing",
    labelEn: "Digital Marketing & Comms",
    labelTh: "การตลาดและการสื่อสารดิจิทัล",
    blurbEn: "Campaign strategy, social media, and multi-platform communication.",
    blurbTh: "กลยุทธ์แคมเปญ โซเชียลมีเดีย และการสื่อสารหลายแพลตฟอร์ม",
    Icon: Megaphone,
    accent: "#F59E0B",
    groupMatchers: ["marketing", "planning", "production", "reporting", "new media"],
    programs: [
      { nameEn: "Digital Marketing Bootcamp", nameTh: "บูทแคมป์การตลาดดิจิทัล", format: "Bootcamp", weeks: 10 },
      { nameEn: "Social Media Strategy Certificate", nameTh: "ประกาศนียบัตรกลยุทธ์โซเชียลมีเดีย", format: "Certificate", weeks: 6 },
    ],
  },
  {
    id: "entrepreneurship",
    labelEn: "Digital Entrepreneurship",
    labelTh: "ผู้ประกอบการดิจิทัล",
    blurbEn: "Venture building, digital business, and applied research paths.",
    blurbTh: "การสร้างธุรกิจ ผู้ประกอบการดิจิทัล และเส้นทางงานวิจัยประยุกต์",
    Icon: Rocket,
    accent: "#F97316",
    groupMatchers: ["other", "personalized", "research"],
    programs: [
      { nameEn: "Startup Founder Bootcamp", nameTh: "บูทแคมป์ผู้ก่อตั้งสตาร์ทอัพ", format: "Bootcamp", weeks: 10 },
      { nameEn: "Digital Business Certificate", nameTh: "ประกาศนียบัตรธุรกิจดิจิทัล", format: "Certificate", weeks: 6 },
    ],
  },
];

const SOFTWARE_TRACK = SUT_TRACKS.find((t) => t.id === "software-engineering")!;
const CREATIVE_TRACK = SUT_TRACKS.find((t) => t.id === "creative-media")!;

/** Resolve the SUT curriculum track that owns a given career. */
export function getTrackForCareer(career: { career_group?: string; program?: string }): SutTrack {
  const group = (career.career_group || "").toLowerCase();
  const match = SUT_TRACKS.find((t) => t.groupMatchers.some((m) => group.includes(m)));
  if (match) return match;
  // Fallback by program branch when the group string is unexpected.
  return (career.program || "").toUpperCase() === "DM" ? CREATIVE_TRACK : SOFTWARE_TRACK;
}

export type ReadinessId = "ready" | "aligned" | "foundational" | "exploratory";

export interface ReadinessTier {
  id: ReadinessId;
  labelEn: string;
  labelTh: string;
  blurbEn: string;
  blurbTh: string;
  color: string;
  /** Inclusive lower bound on the MES score (0-100). */
  min: number;
}

export const READINESS_TIERS: ReadinessTier[] = [
  {
    id: "ready",
    labelEn: "Track Ready",
    labelTh: "พร้อมเข้าสู่สายงาน",
    blurbEn: "Your competencies already meet this track's professional bar.",
    blurbTh: "สมรรถนะของคุณถึงเกณฑ์วิชาชีพของสายงานนี้แล้ว",
    color: "#10B981",
    min: 85,
  },
  {
    id: "aligned",
    labelEn: "Track Aligned",
    labelTh: "ใกล้พร้อมเข้าสู่สายงาน",
    blurbEn: "A strong baseline. A focused program closes the remaining gap.",
    blurbTh: "พื้นฐานแข็งแรง เหลือเพียงโปรแกรมเฉพาะทางเพื่ออุดช่องว่างที่เหลือ",
    color: "#F39200",
    min: 70,
  },
  {
    id: "foundational",
    labelEn: "Foundational",
    labelTh: "ระดับพื้นฐาน",
    blurbEn: "Core groundwork in place. A bootcamp builds job-ready depth.",
    blurbTh: "มีพื้นฐานสำคัญแล้ว บูทแคมป์จะช่วยต่อยอดสู่ระดับพร้อมทำงาน",
    color: "#2563EB",
    min: 55,
  },
  {
    id: "exploratory",
    labelEn: "Exploratory",
    labelTh: "กำลังสำรวจเส้นทาง",
    blurbEn: "Early in this path. A foundation program is the place to start.",
    blurbTh: "อยู่ช่วงเริ่มต้นของเส้นทางนี้ เริ่มจากโปรแกรมปูพื้นฐานก่อน",
    color: "#64748B",
    min: 0,
  },
];

/** Pick the readiness tier for a Match Evaluation Score (MES, 0-100). */
export function getTrackReadiness(mes: number): ReadinessTier {
  return READINESS_TIERS.find((t) => mes >= t.min) ?? READINESS_TIERS[READINESS_TIERS.length - 1];
}

/** MES for a career result: prefer the raw score, fall back to match %. */
export function getMes(career: { raw_mes?: number; match_percentage?: number }): number {
  const raw = typeof career.raw_mes === "number" && career.raw_mes > 0 ? career.raw_mes : undefined;
  return Math.round(raw ?? career.match_percentage ?? 0);
}

/**
 * Accessible foreground for text/icons placed on a solid accent fill.
 * Returns dark ink for bright accents (orange, amber, emerald) and white for
 * dark ones, so a track CTA never ships white-on-bright (which fails contrast).
 */
export function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLin(parseInt(h.slice(0, 2), 16));
  const g = toLin(parseInt(h.slice(2, 4), 16));
  const b = toLin(parseInt(h.slice(4, 6), 16));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? "#1a1100" : "#ffffff";
}
