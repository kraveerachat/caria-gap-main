import type { ReactNode } from "react";
import { RouteGuard } from "@/components/RouteGuard";

// Bouncer: the dashboard requires a segment chosen at "/".
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}
