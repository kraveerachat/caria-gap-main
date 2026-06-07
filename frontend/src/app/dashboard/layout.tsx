import type { ReactNode } from "react";

// Public route: the dashboard gates itself on assessment data (useGapAnalysis),
// not on a login role, so anonymous visitors can complete the flow.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
