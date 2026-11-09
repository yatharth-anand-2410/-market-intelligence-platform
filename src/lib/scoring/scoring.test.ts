import { describe, it, expect } from "vitest";
import { scoreLead } from "./index";

const all = (n: number) => ({ relevance: n, projectActivity: n, evidence: n, requirement: n });

describe("scoreLead", () => {
  it("gives exactly 100 for max signals with sources", () => {
    expect(scoreLead(all(5), 2).score).toBe(100);
  });
  it("gives 0 for zero signals", () => {
    expect(scoreLead(all(0), 0).score).toBe(0);
  });
  it("returns an integer score", () => {
    expect(Number.isInteger(scoreLead({ relevance: 3, projectActivity: 2, evidence: 4, requirement: 1 }, 1).score)).toBe(true);
  });
  it("returns four factors with non-empty reasons", () => {
    const r = scoreLead(all(3), 1);
    expect(r.factors).toHaveLength(4);
    expect(r.factors.every((f) => f.reason.length > 0)).toBe(true);
    expect(r.factors.reduce((s, f) => s + f.max, 0)).toBe(100);
  });
  it("caps evidence points when no sources exist", () => {
    const ev = scoreLead(all(5), 0).factors.find((f) => f.name === "Evidence quality")!;
    expect(ev.points).toBeLessThanOrEqual(5);
  });
});
