"use client";

/**
 * On first authenticated render, claim the guest's anonymous assessments
 * (Roadmap Phase 2). Calls the backend /results/claim with the stable anonId so
 * results created before login are re-keyed to the signed-in user. No-op for
 * guests; idempotent (runs once per mount once authenticated).
 */

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { getAnonId } from "@/lib/anon-id";

export function ClaimOnSignIn() {
  const { status } = useSession();
  const claimed = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || claimed.current) return;
    const anonId = getAnonId();
    if (!anonId) return;
    claimed.current = true;
    api.claimResults(anonId).catch(() => {
      /* best-effort; nothing to claim is fine */
    });
  }, [status]);

  return null;
}
