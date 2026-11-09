import { Assistant } from "@/components/Assistant";
import { getCapabilities } from "@/lib/capabilities";
import { listLeads } from "@/lib/db";

export default function AssistantPage() {
  const caps = getCapabilities({ GEMINI_API_KEY: process.env.GEMINI_API_KEY, GEMINI_VERIFIED: process.env.GEMINI_VERIFIED, GEMINI_GROUNDING: process.env.GEMINI_GROUNDING });
  return <Assistant topLeads={listLeads().slice(0, 20)} researchState={caps.find((c) => c.id === "research")!.state} />;
}
