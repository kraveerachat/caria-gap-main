"use client";

/**
 * Mock authentication for the prototype.
 *
 * Strategy (per spec): the whole flow is usable as an anonymous "Guest".
 * Assessment results live in localStorage. Only when the user explicitly logs
 * in (here: a mocked Google/Facebook OAuth) do we attach an identity — at which
 * point a real implementation would push the locally-stored assessment to the
 * backend keyed by the authenticated user id.
 *
 * Swap mockLogin() for next-auth / Firebase signIn() when wiring real OAuth;
 * the rest of the UI reads through useMockUser() and won't need to change.
 */

import { useEffect, useState } from "react";
import { ROLE_KEY } from "@/hooks/useMockAuth";

export type AuthProvider = "google" | "facebook";

export interface MockUser {
  name: string;
  email: string;
  provider: AuthProvider;
}

const USER_KEY = "sut_caria_user";
const STUDENT_KEY = "sut_caria_student";
const ASSESSMENT_KEYS = ["caria_top10", "user_custom_scores"];
const AUTH_EVENT = "sut-auth-change";

export function getMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function mockLogin(provider: AuthProvider): MockUser {
  const user: MockUser =
    provider === "google"
      ? { name: "สมชาย ใจดี", email: "somchai.demo@gmail.com", provider }
      : { name: "Somchai Jaidee", email: "somchai.demo@facebook.com", provider };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // TODO(real-auth): upload assessment results (ASSESSMENT_KEYS) to the backend
  // and associate them with this user id.
  window.dispatchEvent(new Event(AUTH_EVENT));
  return user;
}

export function mockLogout(): void {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAssessmentHistory(): void {
  ASSESSMENT_KEYS.forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/** Reactive hook — re-renders when auth state changes in this or another tab. */
export function useMockUser(): MockUser | null {
  const [user, setUser] = useState<MockUser | null>(null);
  useEffect(() => {
    const sync = () => setUser(getMockUser());
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return user;
}

/* ---- Unified mock identity (guest OAuth user OR signed-in student) ------ */

export interface MockIdentity {
  label: string;
  kind: "student" | "guest";
}

export interface StudentRecord {
  student_id: string;
  name?: string;
  program?: string;
}

export function getStudentRecord(): StudentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    return raw ? (JSON.parse(raw) as StudentRecord) : null;
  } catch {
    return null;
  }
}

/** The current display identity: a logged-in guest, then a signed-in student. */
export function getMockIdentity(): MockIdentity | null {
  const guest = getMockUser();
  if (guest) return { label: guest.name, kind: "guest" };
  const student = getStudentRecord();
  if (student) return { label: student.name?.trim() || student.student_id, kind: "student" };
  return null;
}

/** Clear every mock auth artifact (guest user, student record, role). */
export function clearMockIdentity(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(STUDENT_KEY);
  localStorage.removeItem(ROLE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/** Reactive identity hook for the header. */
export function useMockIdentity(): MockIdentity | null {
  const [identity, setIdentity] = useState<MockIdentity | null>(null);
  useEffect(() => {
    const sync = () => setIdentity(getMockIdentity());
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return identity;
}
