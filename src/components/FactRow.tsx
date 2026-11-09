import type { Fact } from "@/lib/types";
import { Badge } from "./Badge";

export function FactRow({ label, fact, demo = false }: { label: string; fact: Fact; demo?: boolean }) {
  return (
    <li className="py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{label}</span>
        <Badge kind={fact.provenance}>{demo && fact.provenance === "verified" ? "Verified (illustrative, demo)" : undefined}</Badge>
      </div>
      <p className="mt-0.5">{fact.value}</p>
      <div className="mt-1 text-xs text-muted">
        Researched {fact.researchedAt.slice(0, 10)}
        {fact.sourceUrls.length > 0 && (
          <> · Sources: {fact.sourceUrls.map((u, i) => (
            <a key={u} href={u} target="_blank" rel="noreferrer" className="underline">{i > 0 ? ", " : ""}{new URL(u).hostname}</a>
          ))}</>
        )}
        {fact.sourceUrls.length === 0 && " · No source"}
      </div>
    </li>
  );
}
