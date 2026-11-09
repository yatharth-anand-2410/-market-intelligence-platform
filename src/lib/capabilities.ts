export type CapabilityState = "live" | "ungrounded" | "demo" | "local" | "not_implemented" | "not_connected";

export interface Capability {
  id: string;
  label: string;
  state: CapabilityState;
}

/** GEMINI_VERIFIED is set manually only after live grounding was tested end to end. */
export function getCapabilities(env: { GEMINI_API_KEY?: string; GEMINI_VERIFIED?: string; GEMINI_GROUNDING?: string }): Capability[] {
  const verified = !!env.GEMINI_API_KEY && env.GEMINI_VERIFIED === "true";
  const research: CapabilityState = !verified
    ? "not_connected"
    : env.GEMINI_GROUNDING === "on"
      ? "live"
      : "ungrounded";
  return [
    { id: "research", label: "AI research (Gemini)", state: research },
    { id: "grounding", label: "Google Search grounding (source-verified facts)", state: env.GEMINI_GROUNDING === "on" && verified ? "live" : "not_connected" },
    { id: "leads", label: "Lead database", state: "demo" },
    { id: "projects", label: "Project intelligence", state: "demo" },
    { id: "scoring", label: "Lead scoring", state: "live" },
    { id: "crm", label: "Sales CRM", state: "local" },
    { id: "export", label: "CSV export", state: "live" },
    { id: "persistence", label: "Server-side database", state: "not_implemented" },
    { id: "automation", label: "Scheduled / automated research", state: "not_implemented" },
  ];
}
