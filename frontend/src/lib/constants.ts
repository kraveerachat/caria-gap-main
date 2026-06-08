// Navigation steps for the 3-step wizard flow
export const STEPS = [
  { id: 1, label_th: 'วิเคราะห์ตัวเอง', label_en: 'Assessment', path: '/assessment' },
  { id: 2, label_th: 'ผลลัพธ์อาชีพ', label_en: 'Career Match', path: '/dashboard' },
  { id: 3, label_th: 'ปิด Gap', label_en: 'Close Gaps', path: '/marketplace' },
] as const;

// RIASEC attitude items used in the self-assessment form
export const ATTITUDE_ITEMS = [
  { id: 'A01_Artistic', label_en: 'Artistic', label_th: 'ศิลปะ' },
  { id: 'A02_Conventional', label_en: 'Conventional', label_th: 'ระเบียบแบบแผน' },
  { id: 'A03_Enterprising', label_en: 'Enterprising', label_th: 'ผู้ประกอบการ' },
  { id: 'A04_Investigative', label_en: 'Investigative', label_th: 'สืบเสาะ' },
  { id: 'A05_Realistic', label_en: 'Realistic', label_th: 'ปฏิบัติจริง' },
  { id: 'A06_Social', label_en: 'Social', label_th: 'สังคม' },
] as const;

// Domain color mapping for charts and badges
export const DOMAIN_COLORS: Record<string, string> = {
  skill: '#3B82F6',
  attitude: '#8B5CF6',
  knowledge: '#10B981',
};

// Domain labels (Thai + English)
export const DOMAIN_LABELS: Record<string, string> = {
  skill: 'ทักษะ (Skills)',
  attitude: 'เจตคติ (Attitudes)',
  knowledge: 'ความรู้ (Knowledge)',
};
