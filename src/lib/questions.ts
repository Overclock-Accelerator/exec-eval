export interface Question {
  id: string
  weight: number
  text: string
  short: string
  axis: 'x' | 'y'
}

export const X_QUESTIONS: Question[] = [
  {
    id: 'x1',
    weight: 1,
    axis: 'x',
    short: 'Work product runs through AI',
    text: "How much of your work product — drafts, analyses, strategies, decisions — passes through an AI model before it reaches its final form?",
  },
  {
    id: 'x2',
    weight: 1,
    axis: 'x',
    short: 'Deliberate prompting',
    text: "How deliberately do you work with AI — writing specific instructions, giving it role context, structuring multi-step requests — versus just asking one-off questions?",
  },
  {
    id: 'x3',
    weight: 2,
    axis: 'x',
    short: 'AI embedded in daily tools',
    text: "Have you gone beyond standalone chat tools to use AI that's embedded in or connected to the software you work in daily — email clients, CRM, project tools, communication platforms?",
  },
  {
    id: 'x4',
    weight: 2,
    axis: 'x',
    short: 'Generated something executable',
    text: "Have you used AI to generate something executable — code, scripts, structured data, a configured integration — rather than just text you then act on yourself?",
  },
  {
    id: 'x5',
    weight: 3,
    axis: 'x',
    short: 'Built an automated workflow',
    text: "Have you built — or directed the building of — any workflow where AI takes action automatically, without you triggering each step?",
  },
  {
    id: 'x6',
    weight: 3,
    axis: 'x',
    short: 'AI with persistent memory',
    text: "Have you experimented with AI that has memory or persistent context — where it knows prior interactions, has an ongoing job, or accumulates knowledge over time?",
  },
  {
    id: 'x7',
    weight: 4,
    axis: 'x',
    short: 'Async background agent',
    text: "Have you deployed or worked with an AI agent that operates asynchronously — running in the background, monitoring conditions, and acting when criteria are met, without you initiating each interaction?",
  },
  {
    id: 'x8',
    weight: 5,
    axis: 'x',
    short: 'Autonomous action in live tools',
    text: "Has an AI system ever sent a message, created a record, escalated an issue, or triggered an action in a real business tool — on your behalf and without your real-time approval?",
  },
]

export const Y_QUESTIONS: Question[] = [
  {
    id: 'y1',
    weight: 1,
    axis: 'y',
    short: 'Explain AI in plain terms',
    text: "How confidently could you explain to a colleague, in plain language, what a tool like ChatGPT actually is — and what people mean by a “prompt” and an “AI agent”?",
  },
  {
    id: 'y2',
    weight: 1,
    axis: 'y',
    short: 'Why AI agrees with you',
    text: "Do you understand why tools like ChatGPT tend to agree with you and validate your ideas — and how you'd get it to genuinely challenge your thinking instead?",
  },
  {
    id: 'y3',
    weight: 2,
    axis: 'y',
    short: 'AI connected to your systems',
    text: "Do you understand that AI can be connected to your live systems and data — looking things up or taking action in the tools you already use — rather than only answering from what it was trained on?",
  },
  {
    id: 'y4',
    weight: 2,
    axis: 'y',
    short: 'Off-the-shelf vs. purpose-built',
    text: "Faced with a real task at work, would you know how to judge whether a general tool like ChatGPT is good enough, or whether the job needs something built specifically for it?",
  },
  {
    id: 'y5',
    weight: 3,
    axis: 'y',
    short: 'Break a workflow down for AI',
    text: "If you took one recurring workflow in your business and handed part of it to AI, how confident are you that you could identify which steps AI handles, which still need a person, and where the handoffs happen?",
  },
  {
    id: 'y6',
    weight: 3,
    axis: 'y',
    short: 'Ready-made app vs. built-in',
    text: "Do you understand that the same underlying AI can be used either through a ready-made app or wired directly into your own software and processes — and what a business gains by building on it directly?",
  },
  {
    id: 'y7',
    weight: 4,
    axis: 'y',
    short: 'Judge the right AI approach',
    text: "If someone pitched you an AI solution for a problem you own, how able are you to tell whether the right move is a prompt in a tool you already have, AI connected to your own data, or a custom-built application?",
  },
  {
    id: 'y8',
    weight: 4,
    axis: 'y',
    short: 'What must change to hand off',
    text: "How clearly do you understand what has to change in a workflow — who can access which data, who stays accountable, when a person steps in — before AI can safely own steps your team does today?",
  },
]

// The hardcoded arrays above are the canonical DEFAULTS — the seed used to
// populate the DB and the fallback whenever the DB is empty or unreachable.
// At runtime, questions (text/short/weight) can be edited via /admin and are
// read back from Postgres; see src/lib/storage.ts.
export const ALL_QUESTIONS: Question[] = [...X_QUESTIONS, ...Y_QUESTIONS]

// X weight sum = 1+1+2+2+3+3+4+5 = 21
// Y weight sum = 1+1+2+2+3+3+4+4 = 20 (with default weights)

// Rescale weighted raw score to 0–10 across the *achievable* range.
// Answers are 1–5, so the minimum raw score is WEIGHT_SUM (all 1s) and the
// maximum is WEIGHT_SUM * 5 (all 5s). Mapping that band onto 0–10 means a fully
// novice respondent lands at the origin and the bottom-left cluster hugs the
// corner — which makes the live reveal land harder. All-3s ("Somewhat") = 5.0,
// the quadrant midpoint.
function rescale(raw: number, weightSum: number): number {
  if (weightSum <= 0) return 0
  const min = weightSum // all answers = 1
  const span = weightSum * 5 - min // all answers = 5
  const score = ((raw - min) / span) * 10
  return parseFloat(Math.max(0, Math.min(10, score)).toFixed(2))
}

// Scoring works off whatever question set it's given (default or DB-edited), so
// editing a weight in admin also shifts the achievable range it rescales across.
export function calculateScores(
  answers: Record<string, number>,
  questions: Question[] = ALL_QUESTIONS
): { x: number; y: number } {
  const xq = questions.filter((q) => q.axis === 'x')
  const yq = questions.filter((q) => q.axis === 'y')
  const xRaw = xq.reduce((s, q) => s + (answers[q.id] ?? 1) * q.weight, 0)
  const yRaw = yq.reduce((s, q) => s + (answers[q.id] ?? 1) * q.weight, 0)
  return {
    x: rescale(xRaw, xq.reduce((s, q) => s + q.weight, 0)),
    y: rescale(yRaw, yq.reduce((s, q) => s + q.weight, 0)),
  }
}
