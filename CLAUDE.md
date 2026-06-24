# ExecEval — Executive AI Readiness Survey

## Purpose

Ahmed Haque (ahmed@overclockaccelerator.com) uses this during presentations to executive audiences. Attendees scan a QR code, complete 16 questions on their phones, and Ahmed reveals a live admin quadrant chart showing where everyone falls on **Experimentation** (X) vs. **Conceptual Understanding of AI** (Y).

The goal: surface visually that the audience is in the early stages of their AI journey, creating a shared baseline before the presentation content begins.

---

## URLs

| Path | Purpose |
|------|---------|
| `/` | Survey — the URL the QR points to. Branded intro → 16 questions → thank-you |
| `/qr` | Big scannable QR for a slide (auto-targets the deployment origin) |
| `/admin` | Live admin — 3 views (All Respondents / Room Average / By Question) + "Show QR" overlay. No auth (open URL) |
| `/thank-you` | Post-submission confirmation |
| `/api/submit` | POST `{ answers: Record<string, number> }` → saves, returns `{x,y}` |
| `/api/responses` | GET all responses (incl. raw `answers`) |
| `/api/seed?n=20` | POST — insert N plausible exec responses (demo/rehearsal data) |
| `/api/reset` | POST — delete ALL responses (wired to the "Clear all" admin button) |

**Presentation controls** live in the admin footer: `+ Demo data` (calls `/api/seed`) and `Clear all` (confirm dialog → `/api/reset`). Wipe demo data before the real session.

---

## The 16 Questions

Single source of truth: `src/lib/questions.ts`. Never hardcode questions elsewhere.

### X-Axis: Experimentation (easy → hard, higher weight = harder)

| ID | Weight | Description |
|----|--------|-------------|
| x1 | 1 | Work product through AI |
| x2 | 1 | Deliberate prompting approach |
| x3 | 2 | AI embedded in daily tools |
| x4 | 2 | Executable AI outputs (code, scripts) |
| x5 | 3 | Built automated AI workflows |
| x6 | 3 | AI with persistent memory/context |
| x7 | 4 | Async AI agent operations |
| x8 | 5 | Autonomous actions in live systems (hardest) |

X weight sum: 21. Each question also has a `short` label (used by the By-Question view).

### Y-Axis: Conceptual Understanding (easy → hard)

| ID | Weight | Description |
|----|--------|-------------|
| y1 | 1 | Define 5 AI terms |
| y2 | 1 | ChatGPT sycophancy understanding |
| y3 | 2 | Tool calling concept |
| y4 | 2 | General vs specialized AI |
| y5 | 3 | Workflow decomposition ability |
| y6 | 3 | API vs product distinction |
| y7 | 4 | Evaluating AI approach |
| y8 | 4 | Workflow readiness gap analysis (hardest) |

Y weight sum: 20.

---

## Scoring

Weighted raw score, then **rescaled across the achievable 1–5 range** so a fully
novice respondent lands at the origin (0,0) and the bottom-left cluster hugs the
corner — makes the live reveal land harder.

```
raw      = sum(answer × weight)          // answer ∈ 1..5
min      = weightSum                     // all answers = 1
score    = (raw − min) / (weightSum×5 − min) × 10   // clamped 0–10
```

All-1s → 0, all-3s ("Somewhat") → 5.0 (quadrant midpoint), all-5s → 10. See
`calculateScores()` / `rescale()` in `src/lib/questions.ts`.

---

## Quadrant Labels

| Quadrant | Label | Expected for exec audiences |
|----------|-------|----------------------------|
| Top-right | AI Leader | Rare |
| Top-left | Theorist | Occasional |
| Bottom-right | Practitioner | Occasional |
| Bottom-left | Early Explorer | Most will cluster here |

---

## Stack

- Next.js 16 App Router (Turbopack), React 19, TypeScript, Tailwind **v4**
- Neon Postgres (`@neondatabase/serverless`) for persistence
- `qrcode.react` for the /qr page
- SVG quadrant chart in `src/components/QuadrantChart.tsx`
- No auth on /admin yet (see TODOs)

## Brand / visual design

The UI matches Ahmed's "AI Capacity Building" deck (`74_APEI_AI_Board_Brief_Final.pdf`,
gitignored — kept locally for reference). Pure black background with a subtle
dot-grid texture, **teal** (`#2de3c7`) primary accent, **amber** (`#f2a93b`)
secondary, white text, gray (`#8a8f98`) muted. SF Pro / system sans. Brand tokens
are defined in `src/app/globals.css` under `@theme` (`bg-ink`, `text-teal`,
`text-amber`, `text-mute`, `bg-surface`, `border-line`) plus a `.dot-grid` utility
and `dot-in` / `fade-up` keyframes. Logo + header chrome live in `src/components/Brand.tsx`.

---

## Local Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in DATABASE_URL from https://neon.tech (free tier)
npm run dev
```

---

## Neon Postgres Setup (Production)

1. Create a free DB at https://neon.tech
2. Copy the **pooled connection string** from the dashboard
3. Add to Vercel env vars: `DATABASE_URL`
4. Table is created automatically on first request (`CREATE TABLE IF NOT EXISTS`)

---

## TODOs / backlog

Done: dark deck-matched theme + real Overclock logo, By-Question view, /qr page
+ in-admin QR overlay, scoring rescale (difficulty-weighted), reset + seed
endpoints with admin controls, dot reveal animation, mobile pass (390px),
Y-axis questions reworded to be business-applied / de-jargoned.

Note: /admin is intentionally open (no auth) — Ahmed asked for the password to
be removed. Re-add a gate later if it's ever exposed beyond his own use.

Still open:
- [ ] Optional name field in survey — show initials on dots in admin
- [ ] CSV export button on admin
- [ ] Session cookie to prevent duplicate submissions

---

## Key Files

```
src/lib/questions.ts              Questions, weights, short labels, calculateScores()/rescale()
src/lib/storage.ts                Neon Postgres read/write (+ clearAllResponses)
src/app/page.tsx                  Survey: branded intro + question flow (client)
src/app/admin/page.tsx            Admin: 3-view tabs + presentation controls (refresh 5s)
src/app/qr/page.tsx               QR code page for the slide
src/app/thank-you/page.tsx        Confirmation page
src/components/Brand.tsx          Logo, Wordmark, HeaderBar (brand chrome)
src/components/QuadrantChart.tsx  SVG quadrant chart (teal dots, amber avg, reveal anim)
src/components/QuestionBreakdown.tsx  Per-question average bars (the "where they fall off" view)
src/app/api/submit/route.ts       POST — save a response
src/app/api/responses/route.ts    GET — all responses
src/app/api/seed/route.ts         POST — seed demo data
src/app/api/reset/route.ts        POST — clear all responses
```
