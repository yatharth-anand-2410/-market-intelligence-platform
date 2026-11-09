const styles = {
  demo: "bg-amber-100 text-amber-900 border-amber-300",
  verified: "bg-emerald-100 text-emerald-900 border-emerald-300",
  assumption: "bg-orange-50 text-orange-900 border-orange-300",
  live: "bg-emerald-100 text-emerald-900 border-emerald-300",
  ungrounded: "bg-sky-50 text-sky-900 border-sky-300",
  local: "bg-slate-100 text-slate-800 border-slate-300",
  not_connected: "bg-red-50 text-red-900 border-red-300",
  not_implemented: "bg-zinc-100 text-zinc-700 border-zinc-300",
  neutral: "bg-white text-zinc-700 border-zinc-300",
} as const;

const labels: Partial<Record<keyof typeof styles, string>> = {
  demo: "Demo data",
  verified: "Verified (source)",
  assumption: "AI assumption",
  live: "Live",
  ungrounded: "Live, not web-verified",
  local: "Browser only",
  not_connected: "Not connected",
  not_implemented: "Not implemented",
};

export type BadgeKind = keyof typeof styles;

export function Badge({ kind, children }: { kind: BadgeKind; children?: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium ${styles[kind]}`}>
      {children ?? labels[kind]}
    </span>
  );
}
