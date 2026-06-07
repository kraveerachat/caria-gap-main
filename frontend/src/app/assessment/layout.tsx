import type { ReactNode } from "react";

// Auth is now optional and handled from the header, so the assessment is
// reachable directly from the landing "Start Assessment" CTA (no role gate).
export default function AssessmentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
