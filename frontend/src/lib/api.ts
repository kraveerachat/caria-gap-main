// API client for the CARIA-GAP FastAPI backend (Master Prompt Section 6).

import type {
  GapAnalysisResponse,
  Top10Response,
} from "@/types";
import { MOCK_TOP10, MOCK_GAP_ANALYSIS } from "./mockData";
import { showToast } from "./utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
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
      // showToast("เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง", "error");
      
      console.warn("API Offline, using Mock Data", error);
      // showToast("Offline Mode Active: Using mock data", "info");
      await simulateDelay(2000); // simulate 2s processing
      return MOCK_TOP10;
    }
  },

  getRecommendations: async (userId: string) => {
    try {
      return await request<Top10Response>(`/api/v1/recommendations/${userId}`);
    } catch (error) {
      console.warn("API Offline, using Mock Data", error);
      // showToast("Offline Mode Active", "info");
      return MOCK_TOP10;
    }
  },

  getGapAnalysis: async (userId: string, careerId: string) => {
    try {
      return await request<GapAnalysisResponse>(`/api/v1/gap-analysis/${userId}/${careerId}`);
    } catch (error) {
      console.warn("API Offline, using Mock Data", error);
      // showToast("Offline Mode Active", "info");
      return MOCK_GAP_ANALYSIS;
    }
  },

  simulate: async (userId: string, modifiedScores: Record<string, number>) => {
    try {
      return await request(`/api/v1/simulate`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId, modified_scores: modifiedScores }),
      });
    } catch (error) {
      console.warn("API Offline, simulation bypassed", error);
      return { status: "offline_simulation_ok" };
    }
  },
};
