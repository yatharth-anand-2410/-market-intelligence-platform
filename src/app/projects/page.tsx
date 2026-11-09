import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/ui";
import { listProjects } from "@/lib/db";

export default function ProjectsPage() {
  const projects = listProjects();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">Project intelligence</h1>
        <Badge kind="demo" />
      </div>
      <p className="text-sm text-muted">Publicly documented construction projects and the businesses behind them. These entries are invented for demonstration.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-medium">{p.name}</h2>
              <Badge kind="neutral">{p.type}</Badge>
            </div>
            <p className="mt-1 text-sm">{p.summary}</p>
            <div className="mt-2 text-xs text-muted">
              {p.status} · {p.locality} · Developer:{" "}
              {p.developerId ? <Link className="underline" href={`/leads/${p.developerId}`}>{p.developerName}</Link> : p.developerName}
            </div>
            <div className="mt-1 text-xs text-muted">Researched {p.researchedAt.slice(0, 10)} · Source: placeholder</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
