import { describe, it, expect } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("rate limiter", () => {
  it("rejects the sixth call within a minute from the same key", () => {
    const rl = createRateLimiter();
    for (let i = 0; i < 5; i++) expect(rl("ip", 1000 + i).ok).toBe(true);
    expect(rl("ip", 1010).ok).toBe(false);
  });
  it("allows calls again after the window", () => {
    const rl = createRateLimiter();
    for (let i = 0; i < 5; i++) rl("ip", 1000);
    expect(rl("ip", 1000 + 60_001).ok).toBe(true);
  });
  it("tracks keys independently", () => {
    const rl = createRateLimiter();
    for (let i = 0; i < 5; i++) rl("a", 1000);
    expect(rl("b", 1000).ok).toBe(true);
  });
});
