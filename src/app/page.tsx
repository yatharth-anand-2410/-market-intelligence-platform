import { DashboardView } from "@/components/DashboardView";
import { CapabilityPanel } from "@/components/CapabilityPanel";
import { getCapabilities } from "@/lib/capabilities";
import { getDashboardStats, listLeads } from "@/lib/db";

export default function Home() {
  const all = listLeads();
  return (
    <div className="space-y-6">
      <DashboardView
        stats={getDashboardStats([])}
        topLeads={all.slice(0, 6)}
        names={Object.fromEntries(all.map((l) => [l.id, l.name]))}
      />
      <CapabilityPanel capabilities={getCapabilities({ GEMINI_API_KEY: process.env.GEMINI_API_KEY, GEMINI_VERIFIED: process.env.GEMINI_VERIFIED, GEMINI_GROUNDING: process.env.GEMINI_GROUNDING })} />
    </div>
  );
}
