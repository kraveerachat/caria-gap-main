import type { ReactNode } from "react";
import { RouteGuard } from "@/components/RouteGuard";

// Bouncer: the landing page lives at /home and requires a segment chosen at "/".
export default function HomeLayout({ children }: { children: ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}
