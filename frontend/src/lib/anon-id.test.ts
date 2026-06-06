import { describe, it, expect, beforeEach } from "vitest";
import { getAnonId } from "./anon-id";

describe("getAnonId", () => {
  beforeEach(() => localStorage.clear());

  it("generates an anon_-prefixed id and persists it (stable across calls)", () => {
    const first = getAnonId();
    expect(first).toMatch(/^anon_/);
    expect(getAnonId()).toBe(first);
  });
});
