import { CrmBoard } from "@/components/CrmBoard";
import { listLeads } from "@/lib/db";

export default function CrmPage() {
  return <CrmBoard names={Object.fromEntries(listLeads().map((l) => [l.id, l.name]))} />;
}
