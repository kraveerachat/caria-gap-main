"use client";

/**
 * Frontend-only route guard for the CARIA mock auth flow.
 *
 * The gateway selection card writes a segmentation role to localStorage. These
 * helpers read it and let protected client routes bounce anyone who lands on
 * them without going through the gateway first. No backend, no cookies.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** localStorage key written by the gateway selection card (page.tsx). */
export const ROLE_KEY = "sut_caria_role";
/** Broadcast on login/logout so guards in other tabs/components re-evaluate. */
export const AUTH_EVENT = "sut-auth-change";

export type StoredRole = { role: "student" | "guest"; ts: number };

/** Synchronous, SSR-safe read of the stored role (null on the server). */
export function getMockRole(): StoredRole | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ROLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredRole>;
    return parsed && parsed.role ? (parsed as StoredRole) : null;
  } catch {
    return null;
  }
}

export function hasMockRole(): boolean {
  return getMockRole() !== null;
}

/** Persist the segmentation role and broadcast so guards re-evaluate. */
export function setMockRole(role: StoredRole["role"]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROLE_KEY, JSON.stringify({ role, ts: Date.now() }));
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {
    /* storage unavailable (private mode) — proceed without persistence */
  }
}

export type GuardStatus = "checking" | "authed";

/**
 * Returns "checking" until localStorage is read after hydration. If no role is
 * found it `router.replace`s to the gateway and stays "checking", so the caller
 * keeps rendering its loading state and the protected content never flashes.
 * Once a role exists it flips to "authed". Re-evaluates on cross-tab storage
 * changes and on the in-app auth event (e.g. logout kicks you back out).
 */
export function useMockAuth(redirectTo: string = "/", bypass: boolean = false): GuardStatus {
  const router = useRouter();
  const [status, setStatus] = useState<GuardStatus>("checking");

  useEffect(() => {
    // `bypass` lets a caller short-circuit the gateway gate (e.g. a real NextAuth
    // session is present, or is still resolving) so logged-in users aren't bounced.
    if (bypass) {
      setStatus("authed");
      return;
    }
    const evaluate = () => {
      if (hasMockRole()) {
        setStatus("authed");
      } else {
        setStatus("checking");
        router.replace(redirectTo);
      }
    };
    evaluate();
    window.addEventListener("storage", evaluate);
    window.addEventListener(AUTH_EVENT, evaluate);
    return () => {
      window.removeEventListener("storage", evaluate);
      window.removeEventListener(AUTH_EVENT, evaluate);
    };
  }, [router, redirectTo, bypass]);

  return status;
}
