# Market Intelligence Platform (MVP prototype)

Internal B2B research and sales-intelligence prototype for a plywood, timber, hardware and doors business in Varanasi, India.

**Live demo:** https://market-intelligence-platform-steel.vercel.app

## What is real, and what is not

| Capability | Status |
|---|---|
| Dashboard, lead database, project intelligence | **Demo data.** All records are invented and badged "Demo data". |
| Lead scoring (0-100, explained per factor) | **Working.** Transparent weighted rubric, covered by tests. |
| CSV export (filtered leads, research results) | **Working.** UTF-8 with BOM; handles commas, quotes, Devanagari. |
| AI research assistant (Gemini) | **Working, not web-verified.** Gemini answers without web search; every fact is tagged "AI assumption". |
| Google Search grounding (source-verified facts) | **Implemented, not enabled.** The code path exists (`GEMINI_GROUNDING=on`) but the API key's tier has no grounding quota, so it is untested. |
| Sales CRM (status, calls, meetings, notes, quotations, follow-ups) | **Working, browser-local only.** Not shared, not backed up. |
| Server-side database, login, scheduled research | **Not implemented** (Milestone 2). |
| Email / WhatsApp / outreach | **Does not exist** and will not. |

## Architecture

```
src/lib/
  db/        lead + project repository (seed data today, Postgres in M2)
  scoring/   scoreLead(): relevance 35, project activity 25, evidence 25, requirement 15
  research/  Gemini client, 2-step pipeline (research -> structured extraction), provenance tagging, model fallback
  crm/       browser-local CRM store
  csv.ts     CSV helpers
src/app/api/research   POST: validates, rate-limits (5/min/IP), calls research module
src/app/api/leads/export   GET: filtered CSV
```

The API key is read only on the server (`process.env.GEMINI_API_KEY`). Models are tried in order `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash` (override with `GEMINI_MODELS`).

## Run locally

```
npm install
cp .env.example .env.local   # add GEMINI_API_KEY; set GEMINI_VERIFIED=true only after testing
npm run dev
npm test
```

## Roadmap

- **M2:** Neon Postgres persistence, user login, shared CRM, saved research history, enable Search grounding on a billed key and re-verify.
- **M3:** multi-step research agent with deduplication and re-verification, scheduled research, optional AWS deployment.
