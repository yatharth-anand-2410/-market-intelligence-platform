import { describe, it, expect } from "vitest";
import { listLeads, getLead, listProjects, getDashboardStats } from "./index";
import { CATEGORIES } from "../types";

describe("db", () => {
  it("has at least 24 leads covering every category and 10 projects", () => {
    const all = listLeads();
    expect(all.length).toBeGreaterThanOrEqual(24);
    for (const c of CATEGORIES) expect(all.some((l) => l.category === c)).toBe(true);
    expect(listProjects().length).toBeGreaterThanOrEqual(10);
  });
  it("marks every seed record as demo", () => {
    expect(listLeads().every((l) => l.origin === "demo")).toBe(true);
    expect(listProjects().every((p) => p.origin === "demo")).toBe(true);
  });
  it("attaches a score to every lead", () => {
    expect(listLeads().every((l) => l.score && Number.isInteger(l.score.score))).toBe(true);
  });
  it("filters by category", () => {
    const r = listLeads({ category: "Developer" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((l) => l.category === "Developer")).toBe(true);
  });
  it("searches name and locality case-insensitively", () => {
    const first = listLeads()[0];
    expect(listLeads({ q: first.name.toUpperCase() }).some((l) => l.id === first.id)).toBe(true);
    expect(listLeads({ q: first.locality.toLowerCase() }).some((l) => l.id === first.id)).toBe(true);
  });
  it("filters by minScore", () => {
    const r = listLeads({ minScore: 80 });
    expect(r.every((l) => l.score!.score >= 80)).toBe(true);
  });
  it("returns leads sorted by score descending", () => {
    const s = listLeads().map((l) => l.score!.score);
    expect([...s].sort((a, b) => b - a)).toEqual(s);
  });
  it("getLead returns undefined for unknown id", () => {
    expect(getLead("nope")).toBeUndefined();
  });
  it("computes dashboard stats with thresholds 60 and 80", () => {
    const all = listLeads();
    const st = getDashboardStats([]);
    expect(st.discovered).toBe(all.length);
    expect(st.qualified).toBe(all.filter((l) => l.score!.score >= 60).length);
    expect(st.priority).toBe(all.filter((l) => l.score!.score >= 80).length);
    expect(st.priority).toBeGreaterThan(0);
    expect(st.qualified).toBeGreaterThan(st.priority);
  });
  it("sorts upcoming follow-ups ascending and ignores records without a date", () => {
    const st = getDashboardStats([
      { leadId: "a", status: "New", activities: [], followUpDate: "2026-12-05" },
      { leadId: "b", status: "New", activities: [] },
      { leadId: "c", status: "New", activities: [], followUpDate: "2026-11-20" },
    ]);
    expect(st.upcomingFollowUps.map((f) => f.leadId)).toEqual(["c", "a"]);
  });
});
