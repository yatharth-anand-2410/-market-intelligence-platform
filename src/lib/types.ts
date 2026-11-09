export const CATEGORIES = ["Developer", "Architect/Designer", "Contractor", "Dealer", "Hardware"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["New", "Contacted", "Meeting", "Quotation", "Won", "Lost"] as const;
export type LeadStatus = (typeof STATUSES)[number];

export type Origin = "demo" | "live";
export type Provenance = "verified" | "assumption";

export interface Fact<T = string> {
  value: T;
  provenance: Provenance;
  sourceUrls: string[];
  researchedAt: string;
}

/** Each signal is 0-5. */
export interface Signals {
  relevance: number;
  projectActivity: number;
  evidence: number;
  requirement: number;
}

export interface ScoreFactor {
  name: string;
  points: number;
  max: number;
  reason: string;
}
export interface ScoreResult {
  score: number;
  factors: ScoreFactor[];
}

export interface Lead {
  id: string;
  name: string;
  category: Category;
  locality: string;
  website?: string;
  phone?: string;
  email?: string;
  summary: string;
  sourceUrls: string[];
  researchedAt: string;
  origin: Origin;
  signals: Signals;
  facts: Record<string, Fact>;
  score?: ScoreResult;
}

export interface Project {
  id: string;
  name: string;
  type: "Residential" | "Commercial" | "Mixed-use" | "Institutional";
  status: "Announced" | "Under construction" | "Nearing completion";
  locality: string;
  developerId?: string;
  developerName: string;
  summary: string;
  sourceUrls: string[];
  researchedAt: string;
  origin: Origin;
}

export interface Activity {
  id: string;
  type: "call" | "meeting" | "note" | "quotation";
  text: string;
  at: string;
  amountInr?: number;
}

export interface CrmRecord {
  leadId: string;
  status: LeadStatus;
  followUpDate?: string;
  activities: Activity[];
}
