import { describe, it, expect } from "vitest";
import { withFallback, isRetryable } from "./fallback";

const err = (status: number) => Object.assign(new Error("x"), { status });

describe("withFallback", () => {
  it("returns the first model's result when it succeeds", async () => {
    const tried: string[] = [];
    const r = await withFallback(["a", "b"], async (m) => { tried.push(m); return m; });
    expect(r).toBe("a");
    expect(tried).toEqual(["a"]);
  });
  it("falls through on 429 and 404 to the next model", async () => {
    const r = await withFallback(["a", "b", "c"], async (m) => {
      if (m === "a") throw err(429);
      if (m === "b") throw err(404);
      return m;
    });
    expect(r).toBe("c");
  });
  it("does not retry non-quota errors", async () => {
    const tried: string[] = [];
    await expect(
      withFallback(["a", "b"], async (m) => { tried.push(m); throw err(400); }),
    ).rejects.toMatchObject({ status: 400 });
    expect(tried).toEqual(["a"]);
  });
  it("throws the last error when every model is exhausted", async () => {
    await expect(withFallback(["a", "b"], async () => { throw err(429); })).rejects.toMatchObject({ status: 429 });
  });
  it("treats 429, 404 and 503 as retryable", () => {
    expect([429, 404, 503].every((s) => isRetryable(err(s)))).toBe(true);
    expect(isRetryable(err(400))).toBe(false);
  });
});
