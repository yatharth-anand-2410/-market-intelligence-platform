"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "./Badge";
import { Card } from "./ui";
import { useCrm } from "@/lib/crm/useCrm";
import { STATUSES } from "@/lib/types";

export function CrmBoard({ names }: { names: Record<string, string> }) {
  const crm = useCrm();
  const all = crm.all();
  // Computed after mount: the current date is not stable during prerender.
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);
  const followUps = all.filter((r) => r.followUpDate).sort((a, b) => a.followUpDate!.localeCompare(b.followUpDate!));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">Sales CRM</h1>
        <Badge kind="local" />
      </div>
      <p className="text-sm text-muted">CRM data is saved in this browser only. Open a lead to log calls, meetings, notes and quotations.</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {STATUSES.map((s) => {
          const inStatus = all.filter((r) => r.status === s);
          return (
            <Card key={s} title={`${s} (${inStatus.length})`}>
              <ul className="space-y-1 text-xs">
                {inStatus.length === 0 && <li className="text-muted">–</li>}
                {inStatus.map((r) => <li key={r.leadId}><Link className="hover:underline" href={`/leads/${r.leadId}`}>{names[r.leadId] ?? r.leadId}</Link></li>)}
              </ul>
            </Card>
          );
        })}
      </div>
      <Card title="Follow-ups">
        {followUps.length === 0 && <p className="text-sm text-muted">No follow-ups scheduled.</p>}
        <ul className="divide-y divide-line text-sm">
          {followUps.map((r) => (
            <li key={r.leadId} className="flex justify-between gap-2 py-2">
              <Link href={`/leads/${r.leadId}`} className="hover:underline">{names[r.leadId] ?? r.leadId}</Link>
              <span className={`text-xs tabular-nums ${today && r.followUpDate! < today ? "font-semibold text-red-700" : "text-muted"}`}>{r.followUpDate}{today && r.followUpDate! < today ? " · overdue" : ""}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
