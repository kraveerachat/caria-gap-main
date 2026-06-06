/**
 * Stable per-browser anonymous id (Roadmap Phase 2, guest flow).
 *
 * Guests submit assessments under this id so their results have one consistent
 * key in the backend (`assessment_result.anon_id`). On sign-in, /results/claim
 * re-keys those rows to the authenticated user. Persisted in localStorage to
 * match the app's existing client-storage pattern.
 */

const ANON_KEY = "caria_anon_id";

export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      const rand =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
      id = `anon_${rand}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
