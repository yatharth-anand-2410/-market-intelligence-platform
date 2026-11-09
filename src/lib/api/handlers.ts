import { ResearchError, type ResearchedBusiness } from "../research";
import { scoreLead } from "../scoring";
import type { createRateLimiter } from "../rate-limit";

export const MAX_QUERY = 500;

export interface ResearchDeps {
  apiKey: string | undefined;
  limiter: ReturnType<typeof createRateLimiter>;
  run: (query: string) => Promise<{ businesses: ResearchedBusiness[]; sourceUrls: string[]; researchedAt: string }>;
  now: () => number;
}

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function handleResearch(req: Request, d: ResearchDeps): Promise<Response> {
  if (!d.apiKey) return json({ error: "not_connected" }, 503);

  let query: unknown;
  try {
    query = ((await req.json()) as { query?: unknown })?.query;
  } catch {
    return json({ error: "invalid_query" }, 400);
  }
  if (typeof query !== "string" || !query.trim() || query.length > MAX_QUERY) {
    return json({ error: "invalid_query" }, 400);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!d.limiter(ip, d.now()).ok) return json({ error: "rate_limited" }, 429);

  try {
    const r = await d.run(query.trim());
    const businesses = r.businesses.map((b) => ({
      ...b,
      score: scoreLead(b.signals, b.sourceUrls.length),
    }));
    return json({ businesses, sourceUrls: r.sourceUrls, researchedAt: r.researchedAt });
  } catch (e) {
    return json({ error: "research_failed", code: e instanceof ResearchError ? e.code : "unexpected" }, 502);
  }
}
