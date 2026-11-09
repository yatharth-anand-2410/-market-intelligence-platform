export function Card({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {note && <div className="mt-1 text-xs text-muted">{note}</div>}
    </div>
  );
}

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-line ${className}`} />;
}

export function ErrorPanel({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
      <div className="font-semibold">{title}</div>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded border border-red-400 bg-white px-3 py-1 text-xs font-medium">
          Try again
        </button>
      )}
    </div>
  );
}

export function ScoreChip({ score }: { score: number }) {
  const tone = score >= 80 ? "bg-emerald-600" : score >= 60 ? "bg-amber-600" : "bg-zinc-500";
  return <span className={`inline-block min-w-9 rounded px-1.5 py-0.5 text-center text-xs font-semibold text-white tabular-nums ${tone}`}>{score}</span>;
}
