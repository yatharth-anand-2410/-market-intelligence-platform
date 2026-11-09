import { describe, it, expect } from "vitest";
import { toCsv, leadsToRows } from "./csv";
import { listLeads } from "./db";

describe("toCsv", () => {
  it("quotes values containing commas, quotes and newlines", () => {
    const out = toCsv([{ a: 'x,"y"\nz' }], ["a"]);
    expect(out).toContain('"x,""y""\nz"');
  });
  it("preserves Devanagari text", () => {
    expect(toCsv([{ a: "वाराणसी" }], ["a"])).toContain("वाराणसी");
  });
  it("starts with a UTF-8 BOM and uses CRLF", () => {
    const out = toCsv([{ a: 1 }], ["a"]);
    expect(out.startsWith("﻿")).toBe(true);
    expect(out).toContain("\r\n");
  });
  it("renders null and undefined as empty", () => {
    expect(toCsv([{ a: null, b: undefined }], ["a", "b"])).toBe("﻿a,b\r\n,\r\n");
  });
});

describe("leadsToRows", () => {
  it("joins source urls with ' | ' and includes the origin", () => {
    const lead = listLeads().find((l) => l.sourceUrls.length === 2)!;
    const row = leadsToRows([lead])[0];
    expect(row.source_urls).toBe(lead.sourceUrls.join(" | "));
    expect(row.origin).toBe("demo");
    expect(row.score).toBe(lead.score!.score);
  });
});
