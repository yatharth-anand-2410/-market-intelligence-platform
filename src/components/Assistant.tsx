"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "./Badge";
import { FactRow } from "./FactRow";
import { Card, ErrorPanel, ScoreChip, Skeleton } from "./ui";
import { LEAD_COLUMNS, leadsToRows, toCsv } from "@/lib/csv";
import type { Lead } from "@/lib/types";

const PRIORITISE = "Prioritise the 20 most promising prospects";
const CHIPS = [
  "Find real estate developers in Varanasi",
  "Identify architects working on residential projects",
  "Find construction companies with ongoing projects",
  "Research potential buyers for our premium door brand, Archwood",
  PRIORITISE,
];
const STORE = "mip.research.v1";

type Biz = Lead;
interface Run { query: string; researchedAt: string; businesses: Biz[] }

const ERRORS: Record<string, { title: string; message: string }> = {
  not_connected: { title: "Research is not connected", message: "No Gemini API key is configured on the server, so live research is unavailable." },
  rate_limited: { title: "Too many requests", message: "This demo allows 5 research requests per minute. Please wait a moment." },
  invalid_query: { title: "Check your question", message: "Questions must be between 1 and 500 characters." },
  research_failed: { title: "Research failed", message: "The AI service returned no usable result. Try rephrasing, or try again." },
};

export function Assistant({ topLeads, researchState }: { topLeads: Lead[]; researchState: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [ranked, setRanked] = useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setRun(JSON.parse(raw));
    } catch { /* ignore corrupt or unavailable storage */ }
  }, []);

  const ask = async (q: string) => {
    setErr(null);
    if (q === PRIORITISE) {
      setRanked(true);
      setRun(null);
      return;
    }
    setRanked(false);
    setLoading(true);
    try {
      const res = await fetch("/api/research", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: q }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(body.error ?? "research_failed"); return; }
      const r: Run = { query: q, researchedAt: body.researchedAt, businesses: body.businesses };
      setRun(r);
      try { localStorage.setItem(STORE, JSON.stringify(r)); setSaved(true); } catch { setSaved(false); }
    } catch {
      setErr("research_failed");
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (!run) return;
    const csv = toCsv(leadsToRows(run.businesses), [...LEAD_COLUMNS]);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "research-results.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const e = err ? ERRORS[err] ?? ERRORS.research_failed : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">Research assistant</h1>
        <Badge kind={researchState === "live" ? "live" : researchState === "ungrounded" ? "ungrounded" : "not_connected"} />
      </div>
      {researchState === "ungrounded" && (
        <p className="rounded border border-sky-300 bg-sky-50 p-3 text-xs text-sky-900">
          Answers come from Gemini without web search. Names and details are <strong>not web-verified</strong> and may be inaccurate; every fact is tagged “AI assumption”. Source-verified research needs Google Search grounding (planned).
        </p>
      )}
      <Card>
        <form onSubmit={(ev) => { ev.preventDefault(); if (query.trim()) ask(query.trim()); }} className="flex flex-col gap-2 sm:flex-row">
          <input aria-label="Research question" maxLength={500} value={query} onChange={(ev) => setQuery(ev.target.value)} placeholder="Ask a research question…" className="flex-1 rounded border border-line bg-card px-3 py-2 text-sm" />
          <button disabled={loading || !query.trim()} className="rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? "Researching…" : "Research"}</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <button key={c} disabled={loading} onClick={() => { setQuery(c); ask(c); }} className="rounded-full border border-line bg-background px-3 py-1 text-xs hover:border-accent disabled:opacity-50">{c}</button>
          ))}
        </div>
      </Card>

      {loading && <Card><div className="space-y-3"><Skeleton className="h-5 w-1/3" /><Skeleton /><Skeleton className="w-5/6" /></div></Card>}
      {e && <ErrorPanel title={e.title} message={e.message} onRetry={err === "research_failed" && query ? () => ask(query) : undefined} />}

      {ranked && (
        <Card title="Top 20 prospects" right={<Badge kind="demo" />}>
          <p className="mb-2 text-xs text-muted">Ranked from the lead database by score. No AI call was made.</p>
          <ol className="divide-y divide-line text-sm">
            {topLeads.map((l, i) => (
              <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                <Link href={`/leads/${l.id}`} className="truncate hover:underline">{i + 1}. {l.name} <span className="text-xs text-muted">· {l.category}</span></Link>
                <ScoreChip score={l.score!.score} />
              </li>
            ))}
          </ol>
        </Card>
      )}

      {run && !loading && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>“{run.query}” · {run.businesses.length} results · {run.researchedAt.slice(0, 16).replace("T", " ")} UTC {saved ? "· saved in this browser only" : "· could not be saved"}</span>
            <button onClick={exportCsv} className="rounded border border-line bg-card px-3 py-1 font-medium text-foreground">Export results CSV</button>
          </div>
          {run.businesses.map((b) => (
            <Card key={b.id} title={b.name} right={<div className="flex items-center gap-2"><Badge kind="neutral">{b.category}</Badge><ScoreChip score={b.score!.score} /></div>}>
              <p className="text-sm">{b.summary}</p>
              <p className="mt-1 text-xs text-muted">{b.locality}{b.website ? ` · ${b.website}` : ""}</p>
              <ul className="mt-2 divide-y divide-line">
                {Object.entries(b.facts).map(([l, f]) => <FactRow key={l} label={l} fact={f} />)}
              </ul>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-muted">Why this score</summary>
                <ul className="mt-1 space-y-1">{b.score!.factors.map((f) => <li key={f.name}>{f.name}: {f.points}/{f.max}. {f.reason}</li>)}</ul>
              </details>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
