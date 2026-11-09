# Market Intelligence MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a deployed Next.js MVP of a B2B market-intelligence tool with a working Gemini-grounded research + scoring pipeline, demo-data screens, and a browser-local CRM.

**Architecture:** Four separate modules under `src/lib/` (`db`, `scoring`, `research`, `crm`) with typed interfaces; thin API routes call them; React pages consume them. Server holds the Gemini key. A single capability registry drives honest Live / Demo / Not-implemented badges.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind, Vitest, `@google/genai`, deployed on Vercel.

**Spec:** `docs/superpowers/specs/2026-11-09-market-intelligence-design.md`

## Global Constraints

- Scoring weights: relevance 35, project activity 25, evidence quality 25, requirement potential 15 (sum 100); score is an integer 0-100.
- Every record shown from seed data carries `origin: "demo"` and renders a "Demo data" badge.
- Every extracted fact has `provenance: "verified" | "assumption"`, `sourceUrls: string[]`, `researchedAt: ISO string`. `verified` requires the fact's URL to be in Gemini grounding sources.
- Gemini key read only from `process.env.GEMINI_API_KEY` in server code; never imported by client components.
- `/api/research`: query max 500 chars; in-memory limit 5 requests/minute/IP; HTTP 503 `{error:"not_connected"}` when no key.
- No code that sends email, WhatsApp or any outbound message.
- CRM and saved research persist in `localStorage` only; UI states "Saved in this browser only".
- Lead categories (exact strings): `Developer`, `Architect/Designer`, `Contractor`, `Dealer`, `Hardware`.
- Lead statuses (exact strings): `New`, `Contacted`, `Meeting`, `Quotation`, `Won`, `Lost`.

## Review Focus

- Gemini returns no grounding sources: all facts must degrade to `assumption`, not crash or claim verified.
- Gemini returns malformed or empty extraction JSON: API returns a clean error, UI shows retry, no blank screen.
- CSV values containing commas, quotes, newlines and Devanagari text: output must round-trip and open correctly in Excel (UTF-8 BOM).
- `localStorage` unavailable or corrupt: CRM/pages still render, with an in-memory fallback and a notice.
- Public demo URL abused: rate limit and length cap return 429/400, not Gemini calls.

---

### Task 1: Scaffold, types, capability registry

**Files:**
- Create: Next.js app via `create-next-app` in repo root (TypeScript, Tailwind, App Router, `src/`), `vitest.config.ts`, `.env.example`, `src/lib/types.ts`, `src/lib/capabilities.ts`
- Test: `src/lib/capabilities.test.ts`

**Interfaces:**
- Produces: `types.ts` exports `Category`, `LeadStatus`, `Origin = "demo"|"live"`, `Provenance`, `Fact<T>{value:T; provenance; sourceUrls:string[]; researchedAt:string}`, `Lead`, `Project`, `ScoreResult{score:number; factors:{name:string;points:number;max:number;reason:string}[]}`, `Activity{id;type:"call"|"meeting"|"note"|"quotation";text;at;amountInr?}`, `CrmRecord{leadId;status:LeadStatus;followUpDate?:string;activities:Activity[]}`.
- Produces: `capabilities.ts` exports `getCapabilities(env: {GEMINI_API_KEY?:string}) : {id:string;label:string;state:"live"|"demo"|"local"|"not_implemented"|"not_connected"}[]`.

- [ ] **Step 1: Failing test:** `getCapabilities({})` marks `research` as `not_connected`; with a key marks it `live`... **but** `live` must only be returned when `env.GEMINI_VERIFIED === "true"` (set after manual test in Task 12); with key but unverified returns `not_connected`. `persistence` is always `not_implemented`; `crm` is `local`.
- [ ] **Step 2:** Run `npx vitest run src/lib/capabilities.test.ts`; expect FAIL.
- [ ] **Step 3:** Scaffold app, add Vitest, write types, implement `getCapabilities`.
- [ ] **Step 4:** Run test; expect PASS; run `npm run build`; expect success.
- [ ] **Step 5:** Commit `feat: scaffold app, types and capability registry`.

### Task 2: Seed data and db module

**Files:**
- Create: `src/data/seed.ts`, `src/lib/db/index.ts`
- Test: `src/lib/db/db.test.ts`

**Interfaces:**
- Consumes: Task 1 types.
- Produces: `listLeads(filter?: {category?:Category; q?:string; minScore?:number; status?:LeadStatus}): Lead[]`; `getLead(id:string): Lead|undefined`; `listProjects(): Project[]`; `getDashboardStats(crm: CrmRecord[]): {discovered:number; qualified:number; priority:number; recentResearch:{at:string;query:string}[]; upcomingFollowUps:{leadId:string;date:string}[]}`.
- Seed: at least 24 leads across all five categories and 10 projects in Varanasi/Purvanchal localities; all `origin:"demo"`; fake contact placeholders; each lead has source-URL placeholders marked as illustrative. `qualified` = score >= 60, `priority` = score >= 80.

- [ ] **Step 1: Failing tests:** filter by category returns only that category; `q` matches name/locality case-insensitively; `minScore` filters; every seed lead has `origin:"demo"`; `getLead("nope")` is undefined; `getDashboardStats` counts qualified/priority by thresholds above and returns follow-ups sorted ascending.
- [ ] **Step 2:** Run tests; expect FAIL.
- [ ] **Step 3:** Implement seed (scores precomputed via Task 3 later; leads store `signals` not scores) and db functions. `Lead.signals` = `{relevance:0-5, projectActivity:0-5, evidence:0-5, requirement:0-5}` plus `Lead.score` is computed on read via the scoring module once Task 3 lands; until then db returns signals only.
- [ ] **Step 4:** Run tests; expect PASS.
- [ ] **Step 5:** Commit `feat: seed data and db module`.

### Task 3: Scoring module

**Files:**
- Create: `src/lib/scoring/index.ts`
- Test: `src/lib/scoring/scoring.test.ts`
- Modify: `src/lib/db/index.ts` (attach `scoreLead` result to leads on read)

**Interfaces:**
- Consumes: `Lead.signals`.
- Produces: `scoreLead(signals: Signals, evidenceCount: number): ScoreResult`. Weights per Global Constraints; each signal 0-5 scaled to its max; evidence points capped by `min(signals.evidence, evidenceCount>0 ? 5 : 1)` so unsourced leads cannot score high on evidence.

- [ ] **Step 1: Failing tests:** all-5 signals with sources gives exactly 100; all-0 gives 0; result is an integer; four factors returned with `reason` strings non-empty; lead with `evidenceCount=0` and evidence signal 5 gets at most 5 of 25 evidence points.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement `scoreLead`; wire into db reads.
- [ ] **Step 4:** Run all tests; expect PASS.
- [ ] **Step 5:** Commit `feat: transparent lead scoring`.

### Task 4: CSV export

**Files:**
- Create: `src/lib/csv.ts`
- Test: `src/lib/csv.test.ts`

**Interfaces:**
- Produces: `toCsv(rows: Record<string,string|number|null|undefined>[], columns: string[]): string` (RFC 4180 quoting, `\r\n` line ends, leading `﻿` BOM); `leadsToRows(leads: Lead[]): Record<string,string|number>[]` with columns `name,category,locality,website,phone,email,score,status,source_urls,researched_at,origin`.

- [ ] **Step 1: Failing tests:** value `a,"b"\nc` is quoted with doubled quotes; Devanagari `वाराणसी` preserved; output starts with BOM; null renders empty; `leadsToRows` joins multiple source URLs with ` | `.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement both functions.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit `feat: CSV export helpers`.

### Task 5: Research module (Gemini grounding + extraction)

**Files:**
- Create: `src/lib/research/index.ts`, `src/lib/research/gemini.ts`, `src/lib/research/provenance.ts`
- Test: `src/lib/research/research.test.ts`

**Interfaces:**
- Consumes: `Fact`, `Lead` types.
- Produces:
  - `gemini.ts`: `interface GeminiClient { grounded(query:string): Promise<{text:string; sourceUrls:string[]}>; extract(text:string): Promise<unknown> }` and `createGeminiClient(apiKey:string): GeminiClient` (real SDK; model ID verified against current docs at build time; Search tool on `grounded`, JSON-schema output with no tools on `extract`).
  - `provenance.ts`: `tagProvenance(raw: RawBusiness, groundingUrls: string[], now: Date): ResearchedBusiness`, where a field is `verified` only if one of its `sourceUrls` is in `groundingUrls` (compare normalized host+path).
  - `index.ts`: `runResearch(query:string, client:GeminiClient, now?:Date): Promise<{businesses:ResearchedBusiness[]; sourceUrls:string[]; researchedAt:string}>`; throws `ResearchError("extraction_failed"|"empty")` on malformed or empty extraction.

- [ ] **Step 1: Failing tests with a fake `GeminiClient`:** cited URL present in grounding gives `verified`; cited URL absent gives `assumption`; empty grounding list makes every fact `assumption`; malformed extraction (`"oops"`, `{}`) throws `ResearchError("extraction_failed")`; zero businesses throws `ResearchError("empty")`; every result has `researchedAt` equal to the injected `now`.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement the three files. Validate extraction output with a hand-written type guard.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit `feat: grounded research pipeline with provenance tagging`.

### Task 6: API routes

**Files:**
- Create: `src/app/api/research/route.ts`, `src/app/api/leads/export/route.ts`, `src/lib/rate-limit.ts`
- Test: `src/lib/rate-limit.test.ts`, `src/app/api/research/route.test.ts`

**Interfaces:**
- Consumes: `runResearch`, `createGeminiClient`, `scoreLead`, `listLeads`, `leadsToRows`, `toCsv`.
- Produces: `rateLimit(key:string, now:number, limit=5, windowMs=60000): {ok:boolean}`. `POST /api/research` body `{query:string}` returns `200 {businesses (each with ScoreResult), researchedAt}` | `400 {error:"invalid_query"}` (empty or >500 chars) | `429 {error:"rate_limited"}` | `503 {error:"not_connected"}` | `502 {error:"research_failed"}`. `GET /api/leads/export?category=&q=&minScore=&status=` returns `text/csv` with `Content-Disposition: attachment`.

- [ ] **Step 1: Failing tests:** sixth call within a minute from same key is rejected; calls after the window pass; route returns 400 for 501-char query, 503 without key (no Gemini call attempted), 429 on limit, 502 when module throws `ResearchError`.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement. Client IP from `x-forwarded-for` first value.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit `feat: research and export API routes`.

### Task 7: CRM module

**Files:**
- Create: `src/lib/crm/store.ts`, `src/lib/crm/useCrm.ts`
- Test: `src/lib/crm/store.test.ts`

**Interfaces:**
- Produces: `createCrmStore(storage: Pick<Storage,"getItem"|"setItem"> | null): { get(leadId:string): CrmRecord; all(): CrmRecord[]; setStatus(leadId,s:LeadStatus): void; setFollowUp(leadId,date:string|undefined): void; addActivity(leadId, a:Omit<Activity,"id"|"at">, now?:Date): void; persistent: boolean }`. Default record: status `New`, no activities. `useCrm()` hook wraps it for React, using `window.localStorage` inside try/catch.

- [ ] **Step 1: Failing tests:** new lead defaults to `New`; `addActivity` appends with generated id and timestamp, newest first; state survives re-creating the store on same storage; corrupt JSON in storage yields empty state, no throw; `null` storage works in memory with `persistent=false`.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement store and hook.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit `feat: browser-local CRM store`.

### Task 8: App shell, dashboard, leads table

**Files:**
- Create: `src/components/{Shell,Badge,CapabilityPanel,Skeleton,ErrorPanel}.tsx`, `src/app/page.tsx` (dashboard), `src/app/leads/page.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: db, CRM hook, capabilities, export route.
- Produces: sidebar nav (Dashboard, Leads, Projects, Assistant, CRM), top banner "Internal research tool. No messages are ever sent.", `CapabilityPanel` on dashboard, `Badge` with variants `demo|verified|assumption|live|local`. Leads page: category/status/min-score filters + search, sortable by score, "Export CSV" link that carries the active filters, responsive (cards under 640px).

- [ ] **Step 1:** Implement pages with loading skeletons and an `ErrorPanel` for failures.
- [ ] **Step 2:** Run `npm run build`; expect success; run `npm run dev` in background and open `/` and `/leads` with Playwright at 1280px and 390px widths; expect no console errors, nothing overflowing horizontally.
- [ ] **Step 3:** Click Export on `/leads?category=Developer`; expect downloaded CSV rows all `Developer`.
- [ ] **Step 4:** Commit `feat: dashboard and lead database UI`.

### Task 9: Lead detail and projects

**Files:**
- Create: `src/app/leads/[id]/page.tsx`, `src/app/projects/page.tsx`, `src/components/{ScoreBreakdown,FactRow,CrmPanel}.tsx`

**Interfaces:**
- Consumes: `getLead`, `scoreLead`, `useCrm`, `listProjects`.
- Produces: detail page shows contact, website, sources, researched date, score breakdown with reasons, each fact via `FactRow` with Verified/Assumption badge + source links, and `CrmPanel` (status select, follow-up date, activity form for call/meeting/note/quotation with INR amount). Projects page lists projects with developer link, type, status, source links. Unknown id renders a not-found state.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Playwright: open a lead, change status to `Quotation`, add a call note, reload; expect state persisted. Open `/leads/nope`; expect not-found state, no crash.
- [ ] **Step 3:** Commit `feat: lead detail, CRM panel and projects`.

### Task 10: Research assistant page

**Files:**
- Create: `src/app/assistant/page.tsx`, `src/components/{ResultCard,PromptChips}.tsx`

**Interfaces:**
- Consumes: `POST /api/research`, `toCsv`, `leadsToRows`, `scoreLead` output.
- Produces: input + five prompt chips (exact texts from the brief: "Find real estate developers in Varanasi", "Identify architects working on residential projects", "Find construction companies with ongoing projects", "Research potential buyers for our premium door brand, Archwood", "Prioritise the 20 most promising prospects"). Result cards show score + reasons, facts with provenance badges, source links, timestamp. States: loading, `not_connected` panel (explains the key is missing), `rate_limited`, `research_failed` with retry. "Export results CSV" button. Results kept in `localStorage` with the "saved in this browser only" note.
- Note: "Prioritise top 20" chip ranks the existing lead database by score (no Gemini call) and says so.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Playwright with no key set: submit a query; expect the Not-connected panel, no crash. Click the Prioritise chip; expect 20 ranked demo leads.
- [ ] **Step 3:** Commit `feat: research assistant page`.

### Task 11: CRM overview page

**Files:**
- Create: `src/app/crm/page.tsx`

**Interfaces:**
- Consumes: `useCrm().all()`, `listLeads`.
- Produces: pipeline columns by status with counts, a follow-up list sorted by date with overdue highlighted, link to each lead, and a note "CRM data is saved in this browser only".

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Playwright: after Task 9's changes, the lead appears in the `Quotation` column and its follow-up shows in the list.
- [ ] **Step 3:** Commit `feat: CRM pipeline page`.

### Task 12: Live test, deploy, proposal draft

**Files:**
- Create: `README.md`, `docs/proposal-draft.md`
- Modify: `.env.example`

- [ ] **Step 1:** With the user's key in `.env.local`, run the five prompt-chip queries (except Prioritise) against the real API. Record: grounded sources returned, number of facts `verified` vs `assumption`, any failures. If it works, set `GEMINI_VERIFIED=true`; if not, leave it unset and the UI keeps saying Not connected.
- [ ] **Step 2:** `npm test` and `npm run build`; expect all pass.
- [ ] **Step 3:** Create a Vercel project, set `GEMINI_API_KEY` (and `GEMINI_VERIFIED` if Step 1 passed) as production env vars, deploy to production.
- [ ] **Step 4:** Playwright against the production URL: walk dashboard, leads, detail, export, assistant, CRM at desktop and 390px; expect no console errors.
- [ ] **Step 5:** Write README (architecture, honest status table, M2/M3 roadmap) and `docs/proposal-draft.md` (pitch, architecture, timeline, milestone pricing: M1 $400 fixed, M2/M3 quoted separately).
- [ ] **Step 6:** Commit `docs: README and proposal draft`.
