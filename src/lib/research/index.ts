import { CATEGORIES, type Category } from "../types";
import { tagProvenance, type RawBusiness, type ResearchedBusiness } from "./provenance";
import type { GeminiClient } from "./gemini";

export type { GeminiClient } from "./gemini";
export type { ResearchedBusiness } from "./provenance";

export class ResearchError extends Error {
  constructor(public code: "extraction_failed" | "empty") {
    super(code);
  }
}

const isStr = (v: unknown): v is string => typeof v === "string";
const isRaw = (v: unknown): v is RawBusiness => {
  const b = v as RawBusiness;
  return (
    !!b && isStr(b.name) && isStr(b.locality) && isStr(b.summary) &&
    CATEGORIES.includes(b.category as Category) &&
    !!b.signals && Array.isArray(b.facts) && Array.isArray(b.sourceUrls)
  );
};

export async function runResearch(query: string, client: GeminiClient, now: Date = new Date()) {
  const g = await client.grounded(query);
  let out: unknown;
  try {
    out = await client.extract(g.text, g.sourceUrls);
  } catch {
    throw new ResearchError("extraction_failed");
  }
  const list = (out as { businesses?: unknown } | null)?.businesses;
  if (!Array.isArray(list)) throw new ResearchError("extraction_failed");

  const businesses: ResearchedBusiness[] = list
    .filter(isRaw)
    .map((b) => tagProvenance(b, g.sourceHosts, now));
  if (businesses.length === 0) throw new ResearchError("empty");
  return { businesses, sourceUrls: g.sourceUrls, researchedAt: now.toISOString() };
}
