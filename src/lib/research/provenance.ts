import type { Category, Fact, Lead, Signals } from "../types";

export interface RawFact { label: string; value: string; sourceUrls: string[] }
export interface RawBusiness {
  name: string;
  category: Category;
  locality: string;
  website?: string;
  phone?: string;
  email?: string;
  summary: string;
  signals: Signals;
  facts: RawFact[];
  sourceUrls: string[];
}
export type ResearchedBusiness = Omit<Lead, "score">;

export const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

/**
 * A fact is verified only when at least one of its source URLs is on a host
 * that Gemini's Google Search grounding actually returned. Otherwise it is an
 * AI assumption. Grounding chunk URIs are redirect links, so we match on host.
 */
export function tagProvenance(raw: RawBusiness, groundingHosts: string[], now: Date): ResearchedBusiness {
  const grounded = new Set(groundingHosts.map((h) => h.replace(/^www\./, "").toLowerCase()).filter(Boolean));
  const isGrounded = (urls: string[]) => urls.some((u) => grounded.has(hostOf(u)));
  const researchedAt = now.toISOString();

  const facts: Record<string, Fact> = {};
  for (const f of raw.facts) {
    const urls = f.sourceUrls ?? [];
    facts[f.label] = {
      value: f.value,
      provenance: isGrounded(urls) ? "verified" : "assumption",
      sourceUrls: isGrounded(urls) ? urls : [],
      researchedAt,
    };
  }

  const sourceUrls = (raw.sourceUrls ?? []).filter((u) => grounded.has(hostOf(u)));
  const slug = raw.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `live-${slug}`,
    name: raw.name,
    category: raw.category,
    locality: raw.locality,
    website: raw.website,
    phone: raw.phone,
    email: raw.email,
    summary: raw.summary,
    sourceUrls,
    researchedAt,
    origin: "live",
    signals: raw.signals,
    facts,
  };
}
