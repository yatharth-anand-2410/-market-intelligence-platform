import { LeadsTable } from "@/components/LeadsTable";
import { listLeads } from "@/lib/db";

export default function LeadsPage() {
  return <LeadsTable leads={listLeads()} />;
}
