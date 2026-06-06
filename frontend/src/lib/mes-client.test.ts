import { describe, it, expect } from "vitest";
import { adjustScores, calculateMES, recomputeRanking } from "./mes-client";

// The client MES must stay numerically identical to backend/core/algorithm.py.
// These pin the two equations and the ranking so a regression is caught.

describe("mes-client", () => {
  it("Eq.1: caps a student score at the career requirement, keeps deficits", () => {
    const adjusted = adjustScores({ A: 90, B: 30 }, { A: 70, B: 50 });
    expect(adjusted).toEqual({ A: 70, B: 30 });
  });

  it("Eq.2: identical vectors give MES = 1.0", () => {
    expect(calculateMES({ A: 50, B: 60 }, { A: 50, B: 60 })).toBe(1);
  });

  it("ranks an exact-match career above a distant one", () => {
    const careers = [
      { career_id: "C1", career_name: "Far", career_group: "G", program: "DT", competency_vector: { A: 100 } },
      { career_id: "C2", career_name: "Near", career_group: "G", program: "DT", competency_vector: { A: 50 } },
    ];
    const ranked = recomputeRanking({ A: 50 }, careers);
    expect(ranked[0].career_id).toBe("C2");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].raw_mes).toBeGreaterThan(ranked[1].raw_mes);
  });
});
