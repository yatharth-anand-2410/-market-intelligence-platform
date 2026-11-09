"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "./Badge";
import { Card, ScoreChip } from "./ui";
import { useCrm } from "@/lib/crm/useCrm";
import { LEAD_COLUMNS, leadsToRows, toCsv } from "@/lib/csv";
import { CATEGORIES, STATUSES, type Lead } from "@/lib/types";

const input = "rounded border border-line bg-card px-2 py-1.5 text-sm";

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const crm = useCrm();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState(0);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (!category || l.category === category) &&
        (!status || crm.get(l.id).status === status) &&
        l.score!.score >= minScore &&
        (!needle || l.name.toLowerCase().includes(needle) || l.locality.toLowerCase().includes(needle)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, q, category, status, minScore, crm.ready, crm.all().length, JSON.stringify(crm.all().map((r) => r.status))]);

  const exportCsv = () => {
    const csv = toCsv(leadsToRows(rows, (id) => crm.get(id).status), [...LEAD_COLUMNS]);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">Leads</h1>
        <Badge kind="demo" />
      </div>
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted">Search
            <input className={`${input} mt-1 block w-48`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or locality" />
          </label>
          <label className="text-xs text-muted">Category
            <select className={`${input} mt-1 block`} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Status
            <select className={`${input} mt-1 block`} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Min score: {minScore}
            <input type="range" min={0} max={100} step={5} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="mt-2 block w-36" />
          </label>
          <button onClick={exportCsv} className="ml-auto rounded bg-accent px-3 py-2 text-sm font-medium text-white">
            Export CSV ({rows.length})
          </button>
        </div>
      </Card>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">No leads match these filters.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-line bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs text-muted">
                <tr><th className="p-3">Business</th><th>Category</th><th>Locality</th><th>Score</th><th>Status</th><th>Researched</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-background">
                    <td className="p-3"><Link className="font-medium hover:underline" href={`/leads/${l.id}`}>{l.name}</Link></td>
                    <td>{l.category}</td><td>{l.locality}</td>
                    <td><ScoreChip score={l.score!.score} /></td>
                    <td>{crm.get(l.id).status}</td>
                    <td className="text-xs text-muted">{l.researchedAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-2 md:hidden">
            {rows.map((l) => (
              <li key={l.id} className="rounded-lg border border-line bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/leads/${l.id}`} className="font-medium">{l.name}</Link>
                  <ScoreChip score={l.score!.score} />
                </div>
                <div className="mt-1 text-xs text-muted">{l.category} · {l.locality} · {crm.get(l.id).status}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
