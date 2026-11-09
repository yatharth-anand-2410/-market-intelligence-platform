import { describe, it, expect } from "vitest";
import { createCrmStore } from "./store";

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe("crm store", () => {
  it("defaults a new lead to status New with no activities", () => {
    const s = createCrmStore(mem());
    expect(s.get("x")).toEqual({ leadId: "x", status: "New", activities: [] });
  });
  it("adds activities newest first with id and timestamp", () => {
    const s = createCrmStore(mem());
    s.addActivity("x", { type: "call", text: "first" }, new Date("2026-11-01T00:00:00Z"));
    s.addActivity("x", { type: "quotation", text: "second", amountInr: 50000 }, new Date("2026-11-02T00:00:00Z"));
    const a = s.get("x").activities;
    expect(a.map((i) => i.text)).toEqual(["second", "first"]);
    expect(a[0].id).toBeTruthy();
    expect(a[0].at).toBe("2026-11-02T00:00:00.000Z");
    expect(a[0].amountInr).toBe(50000);
  });
  it("persists status and follow-up across store instances on the same storage", () => {
    const st = mem();
    const a = createCrmStore(st);
    a.setStatus("x", "Meeting");
    a.setFollowUp("x", "2026-12-01");
    const b = createCrmStore(st);
    expect(b.get("x").status).toBe("Meeting");
    expect(b.get("x").followUpDate).toBe("2026-12-01");
    expect(b.all()).toHaveLength(1);
  });
  it("clears a follow-up date when set to undefined", () => {
    const s = createCrmStore(mem());
    s.setFollowUp("x", "2026-12-01");
    s.setFollowUp("x", undefined);
    expect(s.get("x").followUpDate).toBeUndefined();
  });
  it("treats corrupt stored JSON as empty without throwing", () => {
    const st = { getItem: () => "{not json", setItem: () => {} };
    expect(() => createCrmStore(st).get("x")).not.toThrow();
    expect(createCrmStore(st).all()).toEqual([]);
  });
  it("works in memory with persistent=false when storage is null or throws", () => {
    const s = createCrmStore(null);
    s.setStatus("x", "Won");
    expect(s.get("x").status).toBe("Won");
    expect(s.persistent).toBe(false);
    const bad = createCrmStore({ getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
    bad.setStatus("y", "Lost");
    expect(bad.get("y").status).toBe("Lost");
    expect(bad.persistent).toBe(false);
  });
});
