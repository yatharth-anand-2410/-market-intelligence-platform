export type CapabilityState = "live" | "demo" | "local" | "not_implemented" | "not_connected";

export interface Capability {
  id: string;
  label: string;
  state: CapabilityState;
}

/** GEMINI_VERIFIED is set manually only after live grounding was tested end to end. */
export function getCapabilities(env: { GEMINI_API_KEY?: string; GEMINI_VERIFIED?: string }): Capability[] {
  const research: CapabilityState =
    env.GEMINI_API_KEY && env.GEMINI_VERIFIED === "true" ? "live" : "not_connected";
  return [
    { id: "research", label: "AI research (Gemini + Google Search grounding)", state: research },
    { id: "leads", label: "Lead database", state: "demo" },
    { id: "projects", label: "Project intelligence", state: "demo" },
    { id: "scoring", label: "Lead scoring", state: "live" },
    { id: "crm", label: "Sales CRM", state: "local" },
    { id: "export", label: "CSV export", state: "live" },
    { id: "persistence", label: "Server-side database", state: "not_implemented" },
    { id: "automation", label: "Scheduled / automated research", state: "not_implemented" },
  ];
}
