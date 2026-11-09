import { Badge, type BadgeKind } from "./Badge";
import { Card } from "./ui";
import type { Capability } from "@/lib/capabilities";

export function CapabilityPanel({ capabilities }: { capabilities: Capability[] }) {
  return (
    <Card title="What is real in this prototype">
      <ul className="divide-y divide-line text-sm">
        {capabilities.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2">
            <span>{c.label}</span>
            <Badge kind={c.state as BadgeKind} />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Demo records are invented. A capability is shown as Live only after it was tested end to end.
      </p>
    </Card>
  );
}
