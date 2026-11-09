export interface RateResult { ok: boolean }

/** In-memory sliding window. Per server instance only; adequate for demo abuse protection. */
export function createRateLimiter(limit = 5, windowMs = 60_000) {
  const hits = new Map<string, number[]>();
  return (key: string, now: number): RateResult => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return { ok: false };
    }
    recent.push(now);
    hits.set(key, recent);
    return { ok: true };
  };
}
