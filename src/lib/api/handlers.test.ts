import { describe, it, expect, vi } from "vitest";
import { handleResearch } from "./handlers";
import { ResearchError } from "../research";
import { createRateLimiter } from "../rate-limit";

const req = (body: unknown, ip = "1.1.1.1") =>
  new Request("http://x/api/research", {
    method: "POST",
    headers: { "x-forwarded-for": `${ip}, 9.9.9.9`, "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const okResult = {
  businesses: [{
    id: "live-a", name: "A", category: "Developer", locality: "L", summary: "s",
    sourceUrls: [], researchedAt: "t", origin: "live", facts: {},
    signals: { relevance: 3, projectActivity: 3, evidence: 3, requirement: 3 },
  }],
  sourceUrls: [], researchedAt: "t",
};

const deps = (over = {}) => ({
  apiKey: "k" as string | undefined,
  limiter: createRateLimiter(),
  run: vi.fn(async () => okResult),
  now: () => 1000,
  ...over,
});

describe("handleResearch", () => {
  it("returns 503 not_connected without a key and never calls Gemini", async () => {
    const d = deps({ apiKey: undefined });
    const r = await handleResearch(req({ query: "x" }), d as never);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: "not_connected" });
    expect(d.run).not.toHaveBeenCalled();
  });
  it("returns 400 for empty, over-500-char or non-JSON input", async () => {
    for (const body of [{ query: "" }, { query: "a".repeat(501) }, "not json", {}]) {
      const d = deps();
      expect((await handleResearch(req(body), d as never)).status).toBe(400);
      expect(d.run).not.toHaveBeenCalled();
    }
  });
  it("accepts exactly 500 characters", async () => {
    expect((await handleResearch(req({ query: "a".repeat(500) }), deps() as never)).status).toBe(200);
  });
  it("returns 429 after five calls from one IP", async () => {
    const d = deps();
    for (let i = 0; i < 5; i++) await handleResearch(req({ query: "x" }), d as never);
    expect((await handleResearch(req({ query: "x" }), d as never)).status).toBe(429);
  });
  it("returns 502 research_failed when the module throws ResearchError", async () => {
    const d = deps({ run: vi.fn(async () => { throw new ResearchError("empty"); }) });
    const r = await handleResearch(req({ query: "x" }), d as never);
    expect(r.status).toBe(502);
    expect((await r.json()).error).toBe("research_failed");
  });
  it("returns 502 for unexpected errors without leaking the message", async () => {
    const d = deps({ run: vi.fn(async () => { throw new Error("secret key AQ.abc leaked"); }) });
    const r = await handleResearch(req({ query: "x" }), d as never);
    expect(r.status).toBe(502);
    expect(JSON.stringify(await r.json())).not.toContain("secret");
  });
  it("scores each returned business", async () => {
    const r = await handleResearch(req({ query: "x" }), deps() as never);
    const body = await r.json();
    expect(body.businesses[0].score.score).toBe(50);
  });
});
