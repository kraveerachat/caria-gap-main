import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const m = vi.hoisted(() => ({ session: null as { backendToken?: string } | null }));

vi.mock("next-auth/react", () => ({ getSession: () => Promise.resolve(m.session) }));

import { api } from "./api";

describe("api auth header", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    m.session = null;
    fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({ assessment_id: "a", user_id: "u1", timestamp: "t", top10_careers: [] }),
    }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("attaches the backend token as a Bearer header when a session exists", async () => {
    m.session = { backendToken: "tok123" };
    await api.getRecommendations("u1");
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer tok123");
  });

  it("sends no Authorization header for an anonymous guest", async () => {
    m.session = null;
    await api.getRecommendations("u1");
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });
});
