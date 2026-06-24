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
    short: 'Define the core AI terms',
    text: "How accurately can you define these five terms without looking them up: LLM, token, context window, system prompt, AI agent?",
  },
  {
    id: 'y2',
    weight: 1,
    axis: 'y',
    short: 'Why AI agrees with you',
    text: "How well do you understand why a tool like ChatGPT tends to agree with your framing, validate your ideas, and soften criticism — and what you'd need to change to get genuinely challenging, contrarian responses?",
  },
  {
    id: 'y3',
    weight: 2,
    axis: 'y',
    short: 'Tool calling',
    text: "How familiar are you with tool calling — where an AI model can invoke external functions, query a database, run code, or search the web mid-conversation, rather than relying solely on what it was trained to know?",
  },
  {
    id: 'y4',
    weight: 2,
    axis: 'y',
    short: 'General vs. purpose-built AI',
    text: "How clearly do you understand the difference between a general-purpose AI model and a purpose-built AI product designed for a specific task — and when each is the right choice?",
  },
  {
    id: 'y5',
    weight: 3,
    axis: 'y',
    short: 'Decompose a workflow for AI',
    text: "If you had to pick one recurring workflow in your organization and hand part of it to AI today, how confident are you in your ability to identify which steps AI handles, which require human judgment, and what the handoff looks like?",
  },
  {
    id: 'y6',
    weight: 3,
    axis: 'y',
    short: 'API vs. a product like ChatGPT',
    text: "How clearly do you understand what you gain — and give up — by calling an AI model directly via its API versus using a product like ChatGPT built on top of it?",
  },
  {
    id: 'y7',
    weight: 4,
    axis: 'y',
    short: 'Pick the right AI approach',
    text: "If someone proposed an AI solution for a problem you own, how capable are you of evaluating whether the right approach is (a) a prompt in an existing tool, (b) AI connected to your data, or (c) a custom-built application?",
  },
  {
    id: 'y8',
    weight: 4,
    axis: 'y',
    short: 'What must change for handoff',
    text: "How well do you understand what needs to change in a workflow — in terms of data access, decision authority, escalation paths, and accountability — for AI to take over steps that humans currently own?",
  },
]

export const ALL_QUESTIONS: Question[] = [...X_QUESTIONS, ...Y_QUESTIONS]

// X weight sum = 1+1+2+2+3+3+4+5 = 21
// Y weight sum = 1+1+2+2+3+3+4+4 = 20
const X_WEIGHT_SUM = X_QUESTIONS.reduce((s, q) => s + q.weight, 0)
const Y_WEIGHT_SUM = Y_QUESTIONS.reduce((s, q) => s + q.weight, 0)

// Rescale weighted raw score to 0–10 across the *achievable* range.
// Answers are 1–5, so the minimum raw score is WEIGHT_SUM (all 1s) and the
// maximum is WEIGHT_SUM * 5 (all 5s). Mapping that band onto 0–10 means a fully
// novice respondent lands at the origin and the bottom-left cluster hugs the
// corner — which makes the live reveal land harder. All-3s ("Somewhat") = 5.0,
// the quadrant midpoint.
function rescale(raw: number, weightSum: number): number {
  const min = weightSum // all answers = 1
  const span = weightSum * 5 - min // all answers = 5
  const score = ((raw - min) / span) * 10
  return parseFloat(Math.max(0, Math.min(10, score)).toFixed(2))
}

export function calculateScores(answers: Record<string, number>): { x: number; y: number } {
  const xRaw = X_QUESTIONS.reduce((s, q) => s + (answers[q.id] ?? 1) * q.weight, 0)
  const yRaw = Y_QUESTIONS.reduce((s, q) => s + (answers[q.id] ?? 1) * q.weight, 0)
  return {
    x: rescale(xRaw, X_WEIGHT_SUM),
    y: rescale(yRaw, Y_WEIGHT_SUM),
  }
}
