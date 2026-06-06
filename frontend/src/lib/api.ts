// API client for the CARIA-GAP FastAPI backend (Master Prompt Section 6).

import type {
  GapAnalysisResponse,
  Top10Response,
} from "@/types";
import { getSession } from "next-auth/react";
import { MOCK_TOP10, MOCK_GAP_ANALYSIS } from "./mockData";
import { showToast } from "./utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

/**
 * Whether to fall back to bundled mock data when the API call fails. Explicit
 * NEXT_PUBLIC_USE_MOCKS wins; otherwise mocks are on in development (keeps the
 * offline demo working) and OFF in production (real failures surface as errors
 * instead of silently serving fake data). Roadmap Phase 3.
 */
const USE_MOCKS =
  typeof process.env.NEXT_PUBLIC_USE_MOCKS === "string"
    ? process.env.NEXT_PUBLIC_USE_MOCKS === "true"
    : process.env.NODE_ENV !== "production";

/**
 * Bearer header from the current NextAuth session, if any. The backend mints this
 * token (verify-student / OAuth exchange) and validates it; guests have no session,
 * so this returns {} and the request stays anonymous (existing behavior).
 */
async function authHeader(): Promise<Record<string, string>> {
  try {
    const session = await getSession();
    const token = (session as { backendToken?: string } | null)?.backendToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
      ...((init?.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

export interface SubmitPayload {
  user_id: string;
  program: string;
  year?: number;
  gpa?: number;
  scores: Record<string, number>;
  input_method?: string;
  dream_career_group?: string;
  dream_career_id?: string;
}

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface FastTrackApplyResult {
  status: string;
  lead_id: string;
  user_id: string;
  target_track: string;
  mes_score: number;
  transcript_attached: boolean;
  caria_report_attached: boolean;
  message: string;
}

export const api = {
  submitAssessment: async (payload: SubmitPayload) => {
    console.log("Submitting assessment payload:", payload);
    try {
      return await request<Top10Response>("/api/v1/assessment/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Submission failed:", error);
      if (!USE_MOCKS) throw error;
      console.warn("API Offline, using Mock Data", error);
      await simulateDelay(2000); // simulate 2s processing
      return MOCK_TOP10;
    }
  },

  getRecommendations: async (userId: string) => {
    try {
      return await request<Top10Response>(`/api/v1/recommendations/${userId}`);
    } catch (error) {
      if (!USE_MOCKS) throw error;
      console.warn("API Offline, using Mock Data", error);
      return MOCK_TOP10;
    }
  },

  getGapAnalysis: async (userId: string, careerId: string) => {
    try {
      return await request<GapAnalysisResponse>(`/api/v1/gap-analysis/${userId}/${careerId}`);
    } catch (error) {
      if (!USE_MOCKS) throw error;
      console.warn("API Offline, using Mock Data", error);
      return MOCK_GAP_ANALYSIS;
    }
  },

  applyFastTrack: async (form: FormData): Promise<FastTrackApplyResult> => {
    // multipart/form-data — do NOT set Content-Type so the browser appends the
    // multipart boundary itself.
    try {
      const res = await fetch(`${API_BASE}/api/v1/admissions/apply`, {
        method: "POST",
        // No Content-Type: the browser sets the multipart boundary itself.
        headers: { ...(await authHeader()) },
        body: form,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      return (await res.json()) as FastTrackApplyResult;
    } catch (error) {
      // Network-level failure (backend offline): degrade to a mock acceptance so
      // the lead-gen flow still demos end-to-end, mirroring the rest of the app.
      if (error instanceof TypeError && USE_MOCKS) {
        console.warn("API Offline — Fast-Track application mocked locally", error);
        await simulateDelay(900);
        const userId = (form.get("payload") && JSON.parse(String(form.get("payload"))).user_id) || "demo";
        return {
          status: "received",
          lead_id: `LEAD_OFFLINE_${Date.now().toString(36).toUpperCase()}`,
          user_id: userId,
          target_track: "—",
          mes_score: 0,
          transcript_attached: !!form.get("transcript"),
          caria_report_attached: true,
          message: "บันทึกใบสมัครในโหมดออฟไลน์เรียบร้อย (Offline mock)",
        };
      }
      throw error;
    }
  },

  claimResults: async (anonId: string) => {
    // Re-key the guest's anonymous assessments to the signed-in user. The bearer
    // token is attached by request()'s authHeader(); a 401 just means not signed in.
    return await request("/api/v1/results/claim", {
      method: "POST",
      body: JSON.stringify({ anon_id: anonId }),
    });
  },

  simulate: async (userId: string, modifiedScores: Record<string, number>) => {
    try {
      return await request(`/api/v1/simulate`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId, modified_scores: modifiedScores }),
      });
    } catch (error) {
      if (!USE_MOCKS) throw error;
      console.warn("API Offline, simulation bypassed", error);
      return { status: "offline_simulation_ok" };
    }
  },
};
