# ExecEval — Executive AI Readiness Survey

## Purpose

Ahmed Haque (ahmed@overclockaccelerator.com) uses this during presentations to executive audiences. Attendees scan a QR code, complete 16 questions on their phones, and Ahmed reveals a live admin quadrant chart showing where everyone falls on **Experimentation** (X) vs. **Conceptual Understanding of AI** (Y).

The goal: surface visually that the audience is in the early stages of their AI journey, creating a shared baseline before the presentation content begins.

---

## URLs

| Path | Purpose |
|------|---------|
| `/` | Survey — share this / generate QR |
| `/admin` | Admin quadrant — open during presentation |
| `/thank-you` | Post-submission confirmation |
| `/api/submit` | POST `{ answers: Record<string, number> }` |
| `/api/responses` | GET all responses |

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

X weight sum: 21 — max raw score: 105

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

Y weight sum: 20 — max raw score: 100

---

## Scoring

```
X score = sum(answer × weight) / (21 × 5) × 10
Y score = sum(answer × weight) / (20 × 5) × 10
```

Both normalized 0–10. See `calculateScores()` in `src/lib/questions.ts`.

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

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Neon Postgres (`@neondatabase/serverless`) for persistence
- SVG quadrant chart in `src/components/QuadrantChart.tsx`
- No auth on /admin yet (see TODOs)

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

## TODOs for Jed

- [ ] Auth on /admin — simple env var PIN check in middleware
- [ ] Optional name field in survey — show initials on dots in admin
- [ ] Mobile responsiveness pass (test at 375px)
- [ ] CSV export button on admin
- [ ] Reset responses button with confirmation
- [ ] Session cookie to prevent duplicate submissions
- [ ] /qr page — QR code for survey URL (use `qrcode.react`)
- [ ] Animate dots appearing in admin for presentation reveal effect
- [ ] Label dots with initials once name collection is added

---

## Key Files

```
src/lib/questions.ts           Questions, weights, calculateScores()
src/lib/storage.ts             Upstash Redis read/write
src/app/page.tsx               Survey (client component)
src/app/admin/page.tsx         Admin view (auto-refreshes every 10s)
src/app/thank-you/page.tsx     Confirmation page
src/components/QuadrantChart.tsx  SVG quadrant chart
src/app/api/submit/route.ts    POST endpoint
src/app/api/responses/route.ts GET endpoint
```
