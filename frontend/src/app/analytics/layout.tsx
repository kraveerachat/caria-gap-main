import type { ReactNode } from "react";

// Public route: insights are freely explorable; auth is optional via the header.
export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
