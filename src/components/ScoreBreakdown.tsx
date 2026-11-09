import type { ScoreResult } from "@/lib/types";
import { Card, ScoreChip } from "./ui";

export function ScoreBreakdown({ result }: { result: ScoreResult }) {
  return (
    <Card title="Lead score" right={<ScoreChip score={result.score} />}>
      <ul className="space-y-3 text-sm">
        {result.factors.map((f) => (
          <li key={f.name}>
            <div className="flex justify-between"><span>{f.name}</span><span className="tabular-nums text-muted">{f.points} / {f.max}</span></div>
            <div className="mt-1 h-1.5 rounded bg-line"><div className="h-1.5 rounded bg-accent" style={{ width: `${(f.points / f.max) * 100}%` }} /></div>
            <p className="mt-1 text-xs text-muted">{f.reason}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
