import { SEED_LEADS, SEED_PROJECTS, SEED_RESEARCH_LOG } from "@/data/seed";
import { scoreLead } from "../scoring";
import type { Category, CrmRecord, Lead, LeadStatus, Project } from "../types";

export interface LeadFilter {
  category?: Category;
  q?: string;
  minScore?: number;
  status?: LeadStatus;
}

const scored: Lead[] = SEED_LEADS.map((l) => ({
  ...l,
  score: scoreLead(l.signals, l.sourceUrls.length),
})).sort((a, b) => b.score!.score - a.score!.score);

/** Status lives in the browser-side CRM; the server filter only handles the rest. */
export function listLeads(filter: LeadFilter = {}): Lead[] {
  const q = filter.q?.trim().toLowerCase();
  return scored.filter(
    (l) =>
      (!filter.category || l.category === filter.category) &&
      (!q || l.name.toLowerCase().includes(q) || l.locality.toLowerCase().includes(q)) &&
      (filter.minScore === undefined || l.score!.score >= filter.minScore),
  );
}

export function getLead(id: string): Lead | undefined {
  return scored.find((l) => l.id === id);
}

export function listProjects(): Project[] {
  return SEED_PROJECTS;
}

export function getDashboardStats(crm: CrmRecord[]) {
  return {
    discovered: scored.length,
    qualified: scored.filter((l) => l.score!.score >= 60).length,
    priority: scored.filter((l) => l.score!.score >= 80).length,
    recentResearch: SEED_RESEARCH_LOG,
    upcomingFollowUps: crm
      .filter((r): r is CrmRecord & { followUpDate: string } => !!r.followUpDate)
      .map((r) => ({ leadId: r.leadId, date: r.followUpDate }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
