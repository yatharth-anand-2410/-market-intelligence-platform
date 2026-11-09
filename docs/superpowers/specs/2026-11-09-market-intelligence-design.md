# B2B Market Intelligence Platform: Milestone 1 (MVP) Requirements & Design

Source: client job brief (Upwork, fixed-price $400, "Vidya Timber Intelligence"). Repo name is deliberately generic.

## 1. Business context (from the brief)

The client is a family-owned plywood, timber, hardware and interior-solutions business in Varanasi, Uttar Pradesh, India. They are expanding B2B distribution and launching a premium door brand, **Archwood**. They want an **internal research and sales-intelligence tool**, explicitly *not* a conventional CRM and *not* a simple chatbot, that can grow into their long-term market research engine.

**Target customers to research:** real estate builders/developers; architects and interior designers; civil contractors and construction companies; plywood/timber/building-material dealers; hardware distributors and retailers.

## 2. Business requirements and Milestone 1 status

Every row is one thing you can cross-check against the client brief.

| ID | Brief requirement | Milestone 1 delivers | Honest status label in UI |
|---|---|---|---|
| R1 | Business Intelligence Dashboard: discovered businesses, qualified leads, priority prospects, research activity, upcoming follow-ups | Dashboard with those five blocks | Demo data |
| R2 | AI Market Research via Gemini with Google Search grounding where available | Research assistant calling Gemini + Google Search grounding; returns structured businesses with sources | **Live** only if tested with a real key; else "Not connected" |
| R3 | Lead Discovery & Database: name, category, location, website, public contact details, source URLs, research dates | Lead table + detail view with all those fields; filters | Demo data |
| R4 | AI Lead Scoring 0-100 from relevance, potential requirements, project activity, public evidence; explain every score | Scoring module; each score shows per-factor breakdown and written reasons | Rule-based (demo leads), same module scores live results |
| R5 | Project Intelligence: public construction/residential/commercial projects and expansion opportunities | Projects list linked to developers, with source URLs | Demo data |
| R6 | AI Research Assistant answering their five sample questions | Chat page with those five as one-click prompts; free-text too | Live / Not connected |
| R7 | Sales CRM: calls, conversations, meetings, notes, quotations, status, follow-up dates | CRM on each lead: activity log (call/meeting/note/quotation), status, follow-up date | Works; **stored in this browser only** (stated in UI) |
| R8 | CSV export of filtered leads and research results | Export button respects active filters; research results exportable | Works |
| R9 | Secure server-side API key | Key only in server env; never sent to browser | n/a |
| R10 | Separate research, scoring, CRM and database modules | Four separate modules under `src/lib/` | n/a |
| R11 | Source attribution and research timestamps | Every fact carries source URL(s) and a timestamp | n/a |
| R12 | Verified vs AI-assumption distinction | Every field tagged `verified` (source URL appears in Gemini's grounding metadata) or `assumption` | n/a |
| R13 | Loading states, error handling, responsive design | Skeletons/spinners, error panels, mobile layout | n/a |
| R14 | No automatic email/WhatsApp/outreach | No sending code exists; stated on screen | n/a |
| R15 | Demo data must not pass as real research | Every demo record badged "Demo data"; a capability panel lists what is live vs not implemented | n/a |
| R16 | Deploy so the client can click it | Public Vercel URL | n/a |

## 3. Explicitly out of scope for Milestone 1 (proposed as later milestones)

- **M2:** persistent database (Neon Postgres), user login, server-side CRM, saved research history, scheduled research runs.
- **M3:** multi-step agent with deduplication and re-verification, enrichment, AWS deployment option.
- Anything that sends messages. Permanently out of scope.

## 4. Goals, non-goals, anti-goals

- **Goal:** a deployed MVP where a client can click every screen and where the research/scoring pipeline genuinely runs end to end.
- **Non-goals:** auth, multi-user, real persistence, scraping of private data, automated data collection.
- **Anti-goals (would make it a failure even if it works):** demo data that looks like real research; a feature badge saying "Live" for something untested; the API key reachable from the browser; a public endpoint that lets strangers burn the Gemini quota.

## 5. Design decisions (my calls; flag any you disagree with)

1. **Stack:** Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel. React UI plus Node API routes satisfies "React + Node".
2. **Gemini via `@google/genai` directly**, not the Vercel AI Gateway, because Search grounding is a Gemini-native tool.
3. **Two-step research.** Gemini generally cannot combine the Search tool with forced JSON output. Step 1: grounded call returns prose and `groundingMetadata` (source URLs). Step 2: a second, tool-free call extracts that prose into a JSON schema. A fact is `verified` only if the URL it cites is in step 1's grounding sources; everything else is `assumption`. *To be confirmed against the current SDK at build time.*
4. **Persistence:** none server-side in M1. Demo leads ship as a typed seed module behind a repository interface (so M2 swaps in Postgres without touching callers). CRM and saved research live in `localStorage`, and the UI says so.
5. **Demo data:** invented-but-plausible records for categories in R-brief, based on company *types* found publicly in Varanasi; contact fields are fake placeholders and every record is badged "Demo data". Real company names are not used with invented phone numbers or claims.
6. **Abuse protection:** `/api/research` has an in-memory per-IP rate limit and a 500-character query cap, and returns "Not connected" if no key is set.
7. **Scoring:** deterministic weighted rubric (relevance 35, project activity 25, evidence quality 25, requirement potential 15 = 100). Same function scores demo and live leads, with reasons per factor. "AI" part of scoring is that live leads' inputs come from Gemini extraction; the weighting itself is transparent on purpose.

## 6. Open items for the builder

- Exact Gemini model ID (verify current grounded-capable Flash model at build time).
- Visual styling: professional, restrained, dashboard-style. Builder's call.
