import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { CrmPanel } from "@/components/CrmPanel";
import { FactRow } from "@/components/FactRow";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { Card } from "@/components/ui";
import { getLead, listLeads, listProjects } from "@/lib/db";

export function generateStaticParams() {
  return listLeads().map((l) => ({ id: l.id }));
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) notFound();
  const projects = listProjects().filter((p) => p.developerId === lead.id);

  return (
    <div className="space-y-4">
      <Link href="/leads" className="text-xs text-accent underline">← All leads</Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">{lead.name}</h1>
        {lead.origin === "demo" && <Badge kind="demo" />}
        <Badge kind="neutral">{lead.category}</Badge>
      </div>
      <p className="text-sm text-muted">{lead.summary}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Card title="Contact and evidence">
            <dl className="grid grid-cols-[7rem_1fr] gap-y-1 text-sm">
              <dt className="text-muted">Locality</dt><dd>{lead.locality}</dd>
              <dt className="text-muted">Website</dt><dd className="break-all">{lead.website ?? "–"}</dd>
              <dt className="text-muted">Phone</dt><dd>{lead.phone ?? "–"}</dd>
              <dt className="text-muted">Email</dt><dd className="break-all">{lead.email ?? "–"}</dd>
              <dt className="text-muted">Researched</dt><dd>{lead.researchedAt.slice(0, 10)}</dd>
              <dt className="text-muted">Sources</dt>
              <dd className="break-all">{lead.sourceUrls.length ? lead.sourceUrls.join(", ") : "None"}</dd>
            </dl>
            {lead.origin === "demo" && <p className="mt-3 text-xs text-muted">Demo record: contact details and sources are placeholders.</p>}
          </Card>
          <Card title="Facts">
            <ul className="divide-y divide-line">
              {Object.entries(lead.facts).map(([label, f]) => <FactRow key={label} label={label} fact={f} demo={lead.origin === "demo"} />)}
            </ul>
          </Card>
          {projects.length > 0 && (
            <Card title="Linked projects">
              <ul className="text-sm">{projects.map((p) => <li key={p.id} className="py-1">{p.name} <span className="text-xs text-muted">· {p.status}</span></li>)}</ul>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <ScoreBreakdown result={lead.score!} />
          <CrmPanel leadId={lead.id} />
        </div>
      </div>
    </div>
  );
}
