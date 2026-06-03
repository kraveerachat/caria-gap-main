"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Lang = "en" | "th"

// One translation table. Add keys here; sections read them via `useLanguage().t`.
const en = {
  nav: {
    howItWorks: "How it works",
    assessment: "Assessment",
    results: "Results",
    simulator: "Simulator",
    start: "Start Assessment",
  },
  hero: {
    badge: "SUT Advisory & Curriculum Data",
    line1: "Discover Your",
    accent: "Digital Career",
    line3: "Path.",
    sub: "SUT-CARIA provides career guidance and maps your competencies across digital skills, offering detailed SUT curriculum data to guide your future.",
    ctaPrimary: "Discover Your Career",
    ctaSecondary: "See How It Works",
    stats: [
      { label: "Competencies Mapped" },
      { label: "Match Accuracy" },
      { label: "Career Pathways" },
    ],
  },
  howItWorks: {
    eyebrow: "The Process",
    title: "How SUT-CARIA Works",
    subtitle: "Three precision-engineered steps from raw input to career clarity.",
  },
  assessment: {
    eyebrow: "IN-DEPTH EVALUATION",
    title: "Detailed 81-Question Assessment",
    subtitle: "Analyze your skills, knowledge, and attitudes to match your ideal career and SUT courses.",
    module: "Competency Questions (Attitudes & Skills)",
    section: "Assessment Questions",
    questionsCount: "81 Questions Pool",
    disagree: "Disagree",
    agree: "Agree",
    saveAndContinue: "Click here to start the assessment →",
    stronglyDisagreeLabel: "Strongly disagree",
    disagreeLabel: "Disagree",
    neutralLabel: "Neutral",
    agreeLabel: "Agree",
    stronglyAgreeLabel: "Strongly agree",
    questions: [
      "I enjoy breaking down complex problems into structured steps.",
      "I adapt quickly when tools, processes, or priorities change.",
      "I actively seek feedback to improve my work.",
    ],
  },
  results: {
    eyebrow: "Career Intelligence",
    title: "Your Top Career Matches",
    subtitle: "Precision-ranked pathways based on your competency profile and real-time market demand signals.",
    matchScore: "Match Score",
    skillGaps: "skill gaps",
    roadmapTitle: "Career",
    roadmapTitleAccent: "Roadmap",
    roadmapSubtitle: "Upskill timeline to prepare you for your target career path.",
  },
  simulator: {
    eyebrow: "What-If Simulator",
    title: "Explore Your Upskilling Path",
    subtitle: "Adjust your skill levels and watch career match scores update in real-time. Find your optimal learning investment.",
    skillCalibration: "Skill Calibration",
    dragSliders: "Drag sliders to simulate upskilling",
    novice: "Novice",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
    resetBaseline: "Reset to Baseline",
    liveRankings: "Live Rankings",
    liveRankingsSub: "Updates as you calibrate skills",
    tipTitle: "Tip:",
    tipBody1: "Increasing your ",
    tipBody2: " score by 20 points would boost your ",
    tipBody3: " match by approximately ",
    generateRoadmap: "Generate My Learning Roadmap →",
  },
  footer: {
    ctaTitle1: "Your digital career is",
    ctaTitle2: "one assessment away.",
    ctaButton: "Start your assessment",
    desc: "SUT advisory platform and personalized career recommender. Mapping your competencies to the future of work.",
    product: "Product",
    howItWorks: "How it works",
    assessment: "Assessment",
    publicTrends: "Public Trends",
    b2bPortal: "B2B HR Portal",
    company: "Company",
    aboutSUT: "About SUT",
    researchPlan: "Research Plan",
    contact: "Contact",
    resources: "Resources",
    competencyMap: "Competency Map",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    copyright: "SUT-CARIA. All rights reserved.",
    builtFor: "Built for the digital workforce.",
  },
}

const th: typeof en = {
  nav: {
    howItWorks: "วิธีการทำงาน",
    assessment: "แบบประเมิน",
    results: "ผลลัพธ์",
    simulator: "ตัวจำลอง",
    start: "เริ่มประเมิน",
  },
  hero: {
    badge: "แพลตฟอร์มให้คำแนะนำและข้อมูลหลักสูตร มทส.",
    line1: "ค้นหาเส้นทาง",
    accent: "อาชีพดิจิทัล",
    line3: "ที่ใช่สำหรับคุณ",
    sub: "SUT-CARIA ให้คำแนะนำเส้นทางอาชีพ วิเคราะห์ทักษะของคุณ และแสดงข้อมูลหลักสูตรของมหาวิทยาลัยเทคโนโลยีสุรนารี (SUT) เพื่อเตรียมพร้อมสู่อนาคต",
    ctaPrimary: "ค้นหาอาชีพของคุณ",
    ctaSecondary: "ดูวิธีการทำงาน",
    stats: [
      { label: "ทักษะที่ระบบรองรับ" },
      { label: "ความแม่นยำ" },
      { label: "เส้นทางอาชีพ" },
    ],
  },
  howItWorks: {
    eyebrow: "ขั้นตอน",
    title: "SUT-CARIA ทำงานอย่างไร",
    subtitle: "สามขั้นตอนที่ออกแบบอย่างแม่นยำ จากข้อมูลดิบสู่ความชัดเจนในเส้นทางอาชีพ",
  },
  assessment: {
    eyebrow: "การวัดผลลัพธ์เชิงลึก",
    title: "แบบประเมินสมรรถนะ 81 ข้อ",
    subtitle: "แบบประเมินวิเคราะห์ทักษะ ความรู้ และทัศนคติ เพื่อจับคู่สายอาชีพและวิชาเรียน SUT ให้ตรงกับคุณสูงสุด",
    module: "คำถามประเมินสมรรถนะ",
    section: "คำถามประเมิน",
    questionsCount: "คลังคำถาม 81 ข้อ",
    disagree: "ไม่เห็นด้วย",
    agree: "เห็นด้วย",
    saveAndContinue: "คลิกตรงนี้เพื่อเริ่มทำแบบประเมินจริง →",
    stronglyDisagreeLabel: "ไม่เห็นด้วยอย่างยิ่ง",
    disagreeLabel: "ไม่เห็นด้วย",
    neutralLabel: "เฉยๆ",
    agreeLabel: "เห็นด้วย",
    stronglyAgreeLabel: "เห็นด้วยอย่างยิ่ง",
    questions: [
      "ฉันชอบแยกย่อยปัญหาที่ซับซ้อนออกเป็นขั้นตอนที่มีโครงสร้างชัดเจน",
      "ฉันปรับตัวได้เร็วเมื่อเครื่องมือ กระบวนการ หรือลำดับความสำคัญเปลี่ยนไป",
      "ฉันแสวงหาคำแนะนำอย่างจริงจังเพื่อปรับปรุงงานของฉัน",
    ],
  },
  results: {
    eyebrow: "ปัญญาด้านอาชีพ",
    title: "อาชีพที่ตรงกับคุณมากที่สุด",
    subtitle: "เส้นทางที่จัดอันดับอย่างแม่นยำจากโปรไฟล์สมรรถนะของคุณ และสัญญาณความต้องการของตลาดแบบเรียลไทม์ จากการทำแบบทดสอบ",
    matchScore: "คะแนนการจับคู่",
    skillGaps: "ทักษะที่ต้องพัฒนา",
    roadmapTitle: "แผนผัง",
    roadmapTitleAccent: "เส้นทางอาชีพ",
    roadmapSubtitle: "แผนผังเส้นทางการพัฒนาทักษะ (Upskill Timeline) เพื่อเตรียมพร้อมสู่อาชีพเป้าหมาย",
  },
  simulator: {
    eyebrow: "ตัวจำลองสถานการณ์",
    title: "จำลองการปรับระดับทักษะ",
    subtitle: "เลื่อนแถบเพื่อจำลองการพัฒนาทักษะแล้วดูคะแนนจับคู่อาชีพอัปเดตแบบเรียลไทม์ ค้นหาการลงทุนด้านการเรียนรู้ที่คุ้มค่าที่สุด",
    skillCalibration: "จำลองการปรับระดับทักษะ",
    dragSliders: "เลื่อนแถบเพื่อจำลองการพัฒนาทักษะ",
    novice: "ระดับเริ่มต้น",
    intermediate: "ระดับกลาง",
    advanced: "ระดับสูง",
    expert: "ระดับเชี่ยวชาญ",
    resetBaseline: "รีเซ็ตค่าเริ่มต้น",
    liveRankings: "อันดับอาชีพแบบเรียลไทม์",
    liveRankingsSub: "อัปเดตทันทีเมื่อปรับระดับทักษะ",
    tipTitle: "เคล็ดลับ:",
    tipBody1: "การเพิ่มทักษะ ",
    tipBody2: " อีก 20 คะแนน จะช่วยเพิ่มโอกาสแมตช์กับ ",
    tipBody3: " ถึง ",
    generateRoadmap: "สร้างแผนการเรียนรู้ของคุณ",
  },
  footer: {
    ctaTitle1: "ก้าวสู่เส้นทางอาชีพดิจิทัล",
    ctaTitle2: "เริ่มประเมินได้เลย",
    ctaButton: "เริ่มทำแบบประเมิน",
    desc: "แพลตฟอร์มให้คำแนะนำการศึกษาและวิเคราะห์เส้นทางอาชีพส่วนบุคคล จับคู่สมรรถนะของคุณสู่อนาคต",
    product: "ผลิตภัณฑ์",
    howItWorks: "วิธีการทำงาน",
    assessment: "แบบประเมิน",
    publicTrends: "เทรนด์ตลาดงาน",
    b2bPortal: "สำหรับองค์กร (HR)",
    company: "องค์กร",
    aboutSUT: "เกี่ยวกับ มทส.",
    researchPlan: "แผนงานวิจัย",
    contact: "ติดต่อเรา",
    resources: "ทรัพยากร",
    competencyMap: "แผนที่สมรรถนะ",
    privacyPolicy: "นโยบายความเป็นส่วนตัว",
    termsOfService: "ข้อกำหนดการใช้งาน",
    copyright: "SUT-CARIA. สงวนลิขสิทธิ์",
    builtFor: "สร้างมาเพื่อคนทำงานยุคดิจิทัล",
  },
}

type Dict = typeof en

const LanguageContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: Dict
}>({ lang: "en", setLang: () => {}, t: en })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  // Restore saved choice after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    const saved = localStorage.getItem("lang")
    if (saved === "th" || saved === "en") setLangState(saved)
  }, [])

  // Reflect on <html> so global CSS (Thai font) can react if needed.
  useEffect(() => {
    document.documentElement.dataset.lang = lang
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("lang", l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: lang === "th" ? th : en }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
