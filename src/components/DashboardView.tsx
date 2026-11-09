"use client";
import Link from "next/link";
import { Card, Stat, ScoreChip } from "./ui";
import { Badge } from "./Badge";
import { useCrm } from "@/lib/crm/useCrm";
import type { Lead } from "@/lib/types";

interface Props {
  stats: { discovered: number; qualified: number; priority: number; recentResearch: { at: string; query: string }[] };
  topLeads: Lead[];
  names: Record<string, string>;
}

export function DashboardView({ stats, topLeads, names }: Props) {
  const crm = useCrm();
  const followUps = crm
    .all()
    .filter((r) => r.followUpDate)
    .sort((a, b) => a.followUpDate!.localeCompare(b.followUpDate!));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Badge kind="demo" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Businesses discovered" value={stats.discovered} />
        <Stat label="Qualified leads" value={stats.qualified} note="Score 60 or more" />
        <Stat label="Priority prospects" value={stats.priority} note="Score 80 or more" />
        <Stat label="Follow-ups scheduled" value={crm.ready ? followUps.length : "–"} note="From your CRM (this browser)" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Top prospects" right={<Link href="/leads" className="text-xs text-accent underline">All leads</Link>}>
          <ul className="divide-y divide-line text-sm">
            {topLeads.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                <Link href={`/leads/${l.id}`} className="min-w-0 truncate hover:underline">
                  {l.name} <span className="text-xs text-muted">· {l.category}</span>
                </Link>
                <ScoreChip score={l.score!.score} />
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Upcoming follow-ups">
          {crm.ready && followUps.length === 0 && (
            <p className="text-sm text-muted">None yet. Set a follow-up date on any lead.</p>
          )}
          <ul className="divide-y divide-line text-sm">
            {followUps.slice(0, 6).map((r) => (
              <li key={r.leadId} className="flex justify-between gap-2 py-2">
                <Link href={`/leads/${r.leadId}`} className="truncate hover:underline">{names[r.leadId] ?? r.leadId}</Link>
                <span className="text-xs text-muted tabular-nums">{r.followUpDate}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent research activity" right={<Badge kind="demo" />}>
          <ul className="divide-y divide-line text-sm">
            {stats.recentResearch.map((r) => (
              <li key={r.at} className="flex justify-between gap-2 py-2">
                <span className="truncate">{r.query}</span>
                <span className="text-xs text-muted">{r.at.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
