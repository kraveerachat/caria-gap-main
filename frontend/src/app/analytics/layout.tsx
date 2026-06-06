import type { ReactNode } from "react";
import { RouteGuard } from "@/components/RouteGuard";

// Bouncer: analytics shows the visitor's personal insights, so it requires a
// segment chosen at "/". To make this route public again, delete this file.
export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}
