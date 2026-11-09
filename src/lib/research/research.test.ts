import { describe, it, expect } from "vitest";
import { runResearch, ResearchError, type GeminiClient } from "./index";
import { tagProvenance } from "./provenance";

const NOW = new Date("2026-11-09T10:00:00.000Z");

const raw = {
  name: "Test Builders",
  category: "Developer",
  locality: "Sigra",
  website: "https://www.testbuilders.in/",
  summary: "Builds flats.",
  signals: { relevance: 4, projectActivity: 3, evidence: 3, requirement: 3 },
  facts: [
    { label: "Project", value: "Tower A", sourceUrls: ["https://housing.com/x/y"] },
    { label: "Doors", value: "Needs doors", sourceUrls: ["https://random.example/z"] },
    { label: "Guess", value: "Maybe expanding", sourceUrls: [] },
  ],
  sourceUrls: ["https://housing.com/x/y"],
};

const fake = (extractOut: unknown, hosts = ["housing.com"]): GeminiClient => ({
  grounded: async () => ({ text: "prose", sourceUrls: hosts.map((h) => `https://${h}/p`), sourceHosts: hosts }),
  extract: async () => extractOut,
});

describe("tagProvenance", () => {
  it("marks a fact verified when its host is in grounding sources", () => {
    const b = tagProvenance(raw as never, ["housing.com"], NOW);
    expect(b.facts["Project"].provenance).toBe("verified");
  });
  it("marks a fact assumption when its host is not in grounding sources or it has none", () => {
    const b = tagProvenance(raw as never, ["housing.com"], NOW);
    expect(b.facts["Doors"].provenance).toBe("assumption");
    expect(b.facts["Guess"].provenance).toBe("assumption");
  });
  it("makes every fact an assumption when grounding returned no sources", () => {
    const b = tagProvenance(raw as never, [], NOW);
    expect(Object.values(b.facts).every((f) => f.provenance === "assumption")).toBe(true);
    expect(b.sourceUrls).toEqual([]);
  });
  it("stamps researchedAt and origin live", () => {
    const b = tagProvenance(raw as never, ["housing.com"], NOW);
    expect(b.researchedAt).toBe(NOW.toISOString());
    expect(b.origin).toBe("live");
  });
});

describe("runResearch", () => {
  it("returns tagged businesses with timestamp", async () => {
    const r = await runResearch("q", fake({ businesses: [raw] }), NOW);
    expect(r.businesses).toHaveLength(1);
    expect(r.researchedAt).toBe(NOW.toISOString());
  });
  it("throws extraction_failed for malformed output", async () => {
    for (const bad of ["oops", {}, { businesses: "x" }, null]) {
      await expect(runResearch("q", fake(bad), NOW)).rejects.toMatchObject({ code: "extraction_failed" });
    }
  });
  it("throws empty when there are zero businesses", async () => {
    await expect(runResearch("q", fake({ businesses: [] }), NOW)).rejects.toBeInstanceOf(ResearchError);
    await expect(runResearch("q", fake({ businesses: [] }), NOW)).rejects.toMatchObject({ code: "empty" });
  });
  it("drops businesses with an invalid category instead of crashing", async () => {
    const r = await runResearch("q", fake({ businesses: [raw, { ...raw, category: "Wizard" }] }), NOW);
    expect(r.businesses).toHaveLength(1);
  });
});
