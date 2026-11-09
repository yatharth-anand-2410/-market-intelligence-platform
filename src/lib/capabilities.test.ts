import { describe, it, expect } from "vitest";
import { getCapabilities } from "./capabilities";

const state = (caps: ReturnType<typeof getCapabilities>, id: string) =>
  caps.find((c) => c.id === id)?.state;

describe("getCapabilities", () => {
  it("marks research not_connected without a key", () => {
    expect(state(getCapabilities({}), "research")).toBe("not_connected");
  });
  it("keeps research not_connected when key exists but is unverified", () => {
    expect(state(getCapabilities({ GEMINI_API_KEY: "k" }), "research")).toBe("not_connected");
  });
  it("marks research ungrounded when key is verified but grounding is off", () => {
    expect(
      state(getCapabilities({ GEMINI_API_KEY: "k", GEMINI_VERIFIED: "true" }), "research"),
    ).toBe("ungrounded");
  });
  it("marks research live only when verified and GEMINI_GROUNDING is on", () => {
    expect(
      state(getCapabilities({ GEMINI_API_KEY: "k", GEMINI_VERIFIED: "true", GEMINI_GROUNDING: "on" }), "research"),
    ).toBe("live");
  });
  it("always reports persistence as not_implemented and crm as local", () => {
    const caps = getCapabilities({});
    expect(state(caps, "persistence")).toBe("not_implemented");
    expect(state(caps, "crm")).toBe("local");
  });
});
