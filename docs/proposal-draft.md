# Proposal draft (edit before sending)

**Subject: Working demo of the research + scoring pipeline is already live**

Hi,

Your brief asks for an intelligence system, not a chatbot or a plain CRM, and for a clear line between verified information and AI assumptions. I built a working Milestone 1 prototype so you can judge that directly:

**Live demo:** https://timber-chess-masters.vercel.app

**What you can click through today**
- Dashboard, lead database with filters and CSV export, lead detail, project intelligence
- Lead scoring 0-100, with every score broken down into four weighted factors and written reasons
- Research assistant on Gemini with your five sample questions as one-click prompts. Every result carries a research timestamp, and every fact is tagged **Verified (source)** or **AI assumption**
- Sales CRM: status, calls, meetings, notes, quotations, follow-up dates
- Gemini key is server-side only; the research endpoint is rate-limited

**What is honestly not done yet** (the demo says so on screen)
- All leads and projects in the database are invented demo data and are labelled as such
- Research currently runs without web search, so results are tagged "AI assumption". Google Search grounding is implemented but needs a key with grounding quota, and I will not mark it live until it is tested
- CRM is stored in the browser only. A shared database is the first job of Milestone 2
- No email, WhatsApp or outreach, by design

**Architecture:** Next.js (React + Node) on Vercel; separate research, scoring, CRM and database modules; Gemini with model fallback; provenance tagging on every extracted fact; automated tests on scoring, provenance, CSV, rate limiting and the API.

**Milestones**
1. **MVP (this demo, polished and handed over):** $400 fixed, 5-7 days. Includes your feedback round.
2. **Persistence + accounts:** Neon Postgres, login, shared CRM, saved research history, Search grounding enabled and verified. Quote: [fill in]
3. **Research agent:** multi-step research with deduplication and re-verification, scheduled runs, AWS option. Quote: [fill in]

I can walk through the demo on a call and adjust scoring weights to match how you actually qualify builders and architects.

[Your name]
