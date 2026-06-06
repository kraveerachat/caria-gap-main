"use client";

import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useMockAuth } from "@/hooks/useMockAuth";
import { RouteLoadingScreen } from "@/components/RouteLoadingScreen";

/**
 * Wraps a protected route. Access is granted if EITHER a real NextAuth session
 * exists OR the mock gateway role is set (Roadmap Phase 2, "login optional"):
 * logged-in users are never bounced to the gateway, and anonymous guests keep
 * working exactly as before. Renders the branded loader while either check is
 * still resolving; if neither passes, useMockAuth redirects to the gateway.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { status: sessionStatus } = useSession();
  const sessionResolved = sessionStatus !== "loading";
  const authed = sessionStatus === "authenticated";

  // Bypass the gateway gate while the session is resolving and when authenticated,
  // so a logged-in (or about-to-be-known) user isn't redirected out.
  const mockStatus = useMockAuth("/", !sessionResolved || authed);

  if (!sessionResolved) return <RouteLoadingScreen />;
  if (authed) return <>{children}</>;
  return mockStatus === "authed" ? <>{children}</> : <RouteLoadingScreen />;
}
