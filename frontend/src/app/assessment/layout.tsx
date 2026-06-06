import type { ReactNode } from "react";
import { RouteGuard } from "@/components/RouteGuard";

// Bouncer: /assessment is reachable only after picking a segment at "/".
export default function AssessmentLayout({ children }: { children: ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}
