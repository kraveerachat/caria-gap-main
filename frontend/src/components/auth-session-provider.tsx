"use client";

// Wraps the app in Auth.js's SessionProvider so client components can call
// useSession(). Additive (Roadmap Phase 2): the existing mock-auth gateway still
// works; this just makes a real NextAuth session available alongside it.

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ClaimOnSignIn } from "@/components/claim-on-signin";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ClaimOnSignIn />
      {children}
    </SessionProvider>
  );
}
