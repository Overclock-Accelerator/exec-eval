# ExecEval — Full Question List

16 questions, answered on a 1–5 scale (1 = Not at all → 5 = Extensively).
Weights climb as questions get harder, so harder questions pull the score more.
Single source of truth: `src/lib/questions.ts`.

**Scale:** 1 Not at all · 2 Barely (just starting) · 3 Somewhat · 4 Meaningfully · 5 Extensively

---

## Part 1 — Experimentation (X axis)
*How much they actually use AI. Easy → hard.*

| # | Wt | Short label | Question |
|---|----|-------------|----------|
| X1 | 1 | Work product runs through AI | How much of your work product — drafts, analyses, strategies, decisions — passes through an AI model before it reaches its final form? |
| X2 | 1 | Deliberate prompting | How deliberately do you work with AI — writing specific instructions, giving it role context, structuring multi-step requests — versus just asking one-off questions? |
| X3 | 2 | AI embedded in daily tools | Have you gone beyond standalone chat tools to use AI that's embedded in or connected to the software you work in daily — email clients, CRM, project tools, communication platforms? |
| X4 | 2 | Generated something executable | Have you used AI to generate something executable — code, scripts, structured data, a configured integration — rather than just text you then act on yourself? |
| X5 | 3 | Built an automated workflow | Have you built — or directed the building of — any workflow where AI takes action automatically, without you triggering each step? |
| X6 | 3 | AI with persistent memory | Have you experimented with AI that has memory or persistent context — where it knows prior interactions, has an ongoing job, or accumulates knowledge over time? |
| X7 | 4 | Async background agent | Have you deployed or worked with an AI agent that operates asynchronously — running in the background, monitoring conditions, and acting when criteria are met, without you initiating each interaction? |
| X8 | 5 | Autonomous action in live tools | Has an AI system ever sent a message, created a record, escalated an issue, or triggered an action in a real business tool — on your behalf and without your real-time approval? |

---

## Part 2 — Conceptual Understanding (Y axis)
*Whether they understand AI well enough to apply it to their business. Easy → hard.*

| # | Wt | Short label | Question |
|---|----|-------------|----------|
| Y1 | 1 | Explain AI in plain terms | How confidently could you explain to a colleague, in plain language, what a tool like ChatGPT actually is — and what people mean by a "prompt" and an "AI agent"? |
| Y2 | 1 | Why AI agrees with you | Do you understand why tools like ChatGPT tend to agree with you and validate your ideas — and how you'd get it to genuinely challenge your thinking instead? |
| Y3 | 2 | AI connected to your systems | Do you understand that AI can be connected to your live systems and data — looking things up or taking action in the tools you already use — rather than only answering from what it was trained on? |
| Y4 | 2 | Off-the-shelf vs. purpose-built | Faced with a real task at work, would you know how to judge whether a general tool like ChatGPT is good enough, or whether the job needs something built specifically for it? |
| Y5 | 3 | Break a workflow down for AI | If you took one recurring workflow in your business and handed part of it to AI, how confident are you that you could identify which steps AI handles, which still need a person, and where the handoffs happen? |
| Y6 | 3 | Ready-made app vs. built-in | Do you understand that the same underlying AI can be used either through a ready-made app or wired directly into your own software and processes — and what a business gains by building on it directly? |
| Y7 | 4 | Judge the right AI approach | If someone pitched you an AI solution for a problem you own, how able are you to tell whether the right move is a prompt in a tool you already have, AI connected to your own data, or a custom-built application? |
| Y8 | 4 | What must change to hand off | How clearly do you understand what has to change in a workflow — who can access which data, who stays accountable, when a person steps in — before AI can safely own steps your team does today? |

---

## Scoring

```
raw   = sum(answer × weight)            answer ∈ 1..5
score = (raw − weightSum) / (weightSum×5 − weightSum) × 10   (clamped 0–10)
```

Each axis is scored independently and plotted on the quadrant.
All-1s → 0 · all-3s ("Somewhat") → 5.0 (center) · all-5s → 10.
X weight sum = 21 · Y weight sum = 20.
