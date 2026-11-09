import type { ScoreResult, Signals } from "../types";

const WEIGHTS = { relevance: 35, projectActivity: 25, evidence: 25, requirement: 15 } as const;

const clamp = (n: number) => Math.max(0, Math.min(5, Math.round(n)));
const pts = (signal: number, max: number) => Math.round((signal / 5) * max);

const REASONS = {
  relevance: [
    "No sign this business buys plywood, doors or hardware.",
    "Weak fit: adjacent to our buyers.",
    "Partial fit with our target customer types.",
    "Good fit: regularly specifies or buys our product categories.",
    "Strong fit: core buyer of plywood, doors and interior materials.",
    "Ideal fit: core buyer in our home market.",
  ],
  projectActivity: [
    "No public project activity found.",
    "Historic projects only.",
    "Some recent projects documented.",
    "Active projects documented publicly.",
    "Multiple active projects documented publicly.",
    "Several large, active projects documented publicly.",
  ],
  evidence: [
    "No public evidence found.",
    "Single weak or unsourced mention.",
    "Limited public evidence.",
    "Reasonable public evidence from a few sources.",
    "Good evidence from multiple sources.",
    "Strong, multi-source public evidence.",
  ],
  requirement: [
    "No indication of near-term material requirement.",
    "Low likely requirement.",
    "Moderate potential requirement.",
    "Likely near-term requirement.",
    "High likely requirement (e.g. doors in running projects).",
    "Very high likely requirement.",
  ],
} as const;

export function scoreLead(signals: Signals, evidenceCount: number): ScoreResult {
  const s = {
    relevance: clamp(signals.relevance),
    projectActivity: clamp(signals.projectActivity),
    // Without any source URL, evidence cannot exceed a minimal level.
    evidence: Math.min(clamp(signals.evidence), evidenceCount > 0 ? 5 : 1),
    requirement: clamp(signals.requirement),
  };
  const factors = [
    { name: "Business relevance", key: "relevance", max: WEIGHTS.relevance },
    { name: "Project activity", key: "projectActivity", max: WEIGHTS.projectActivity },
    { name: "Evidence quality", key: "evidence", max: WEIGHTS.evidence },
    { name: "Potential requirement", key: "requirement", max: WEIGHTS.requirement },
  ] as const;
  const out = factors.map((f) => ({
    name: f.name,
    max: f.max,
    points: pts(s[f.key], f.max),
    reason:
      f.key === "evidence" && evidenceCount === 0
        ? "No source URL attached, so evidence is capped."
        : REASONS[f.key][s[f.key]],
  }));
  return { score: out.reduce((a, f) => a + f.points, 0), factors: out };
}
