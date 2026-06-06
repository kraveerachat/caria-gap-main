"use client";

/**
 * React Query hooks wrapping the api client (Roadmap Phase 3). Components can
 * migrate from manual useEffect+useState data loading to these for caching,
 * retries, and consistent loading/error states. Response shapes are unchanged
 * (same types as api.ts), so adoption is incremental and non-breaking.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { api, type SubmitPayload } from "@/lib/api";

export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ["recommendations", userId],
    queryFn: () => api.getRecommendations(userId as string),
    enabled: Boolean(userId),
  });
}

export function useGapAnalysis(userId?: string, careerId?: string) {
  return useQuery({
    queryKey: ["gap-analysis", userId, careerId],
    queryFn: () => api.getGapAnalysis(userId as string, careerId as string),
    enabled: Boolean(userId) && Boolean(careerId),
  });
}

export function useSubmitAssessment() {
  return useMutation({
    mutationFn: (payload: SubmitPayload) => api.submitAssessment(payload),
  });
}
