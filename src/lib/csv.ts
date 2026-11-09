import type { Lead } from "./types";

type Cell = string | number | null | undefined;

export const LEAD_COLUMNS = [
  "name", "category", "locality", "website", "phone", "email",
  "score", "status", "source_urls", "researched_at", "origin",
] as const;

const esc = (v: Cell): string => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(rows: Record<string, Cell>[], columns: string[]): string {
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))];
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export function leadsToRows(leads: Lead[], statusOf: (id: string) => string = () => "New"): Record<string, Cell>[] {
  return leads.map((l) => ({
    name: l.name,
    category: l.category,
    locality: l.locality,
    website: l.website,
    phone: l.phone,
    email: l.email,
    score: l.score?.score,
    status: statusOf(l.id),
    source_urls: l.sourceUrls.join(" | "),
    researched_at: l.researchedAt,
    origin: l.origin,
  }));
}
