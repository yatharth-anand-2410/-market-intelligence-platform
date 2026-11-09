import { listLeads } from "@/lib/db";
import { leadsToRows, toCsv, LEAD_COLUMNS } from "@/lib/csv";
import { CATEGORIES, type Category } from "@/lib/types";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const cat = p.get("category");
  const min = Number(p.get("minScore"));
  const leads = listLeads({
    category: CATEGORIES.includes(cat as Category) ? (cat as Category) : undefined,
    q: p.get("q") ?? undefined,
    minScore: Number.isFinite(min) && p.get("minScore") ? min : undefined,
  });
  return new Response(toCsv(leadsToRows(leads), [...LEAD_COLUMNS]), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="leads.csv"',
    },
  });
}
