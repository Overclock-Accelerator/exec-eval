import { neon } from '@neondatabase/serverless'
import { v4 as uuidv4 } from 'uuid'
import { ALL_QUESTIONS, type Question } from './questions'

export interface SurveyResponse {
  id: string
  answers: Record<string, number>
  x: number
  y: number
  submittedAt: string
}

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set. See .env.local.example.')
  return neon(url)
}

export async function initDb(): Promise<void> {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      answers JSONB NOT NULL,
      x DECIMAL(5,2) NOT NULL,
      y DECIMAL(5,2) NOT NULL,
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

export async function saveResponse(
  answers: Record<string, number>,
  x: number,
  y: number
): Promise<SurveyResponse> {
  const sql = getSql()
  const id = uuidv4()
  await initDb()
  await sql`
    INSERT INTO responses (id, answers, x, y)
    VALUES (${id}, ${JSON.stringify(answers)}, ${x}, ${y})
  `
  return { id, answers, x, y, submittedAt: new Date().toISOString() }
}

export async function clearAllResponses(): Promise<void> {
  const sql = getSql()
  await initDb()
  await sql`DELETE FROM responses`
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
  try {
    const sql = getSql()
    await initDb()
    const rows = await sql`SELECT id, answers, x, y, submitted_at FROM responses ORDER BY submitted_at DESC`
    return rows.map((r) => ({
      id: r.id as string,
      answers: r.answers as Record<string, number>,
      x: Number(r.x),
      y: Number(r.y),
      submittedAt: r.submitted_at as string,
    }))
  } catch (err) {
    console.error('Storage error:', err)
    return []
  }
}

// ---- Questions ----------------------------------------------------------
// Questions live in `src/lib/questions.ts` as canonical defaults, but their
// editable fields (text/short/weight) are stored here so admins can tweak them
// live. The table is seeded from the defaults on first touch; axis and the set
// of IDs never change (no add/delete from the UI), so seeding is one-time.

export async function initQuestionsDb(): Promise<void> {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      axis TEXT NOT NULL,
      weight INTEGER NOT NULL,
      text TEXT NOT NULL,
      short TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    )
  `
  // Seed any missing rows from the defaults (also self-heals if a new default
  // question is added in code later). Existing edited rows are left untouched.
  for (let i = 0; i < ALL_QUESTIONS.length; i++) {
    const q = ALL_QUESTIONS[i]
    await sql`
      INSERT INTO questions (id, axis, weight, text, short, sort_order)
      VALUES (${q.id}, ${q.axis}, ${q.weight}, ${q.text}, ${q.short}, ${i})
      ON CONFLICT (id) DO NOTHING
    `
  }
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const sql = getSql()
    await initQuestionsDb()
    const rows = await sql`
      SELECT id, axis, weight, text, short FROM questions ORDER BY sort_order ASC
    `
    if (rows.length === 0) return ALL_QUESTIONS
    return rows.map((r) => ({
      id: r.id as string,
      axis: r.axis as 'x' | 'y',
      weight: Number(r.weight),
      text: r.text as string,
      short: r.short as string,
    }))
  } catch (err) {
    console.error('Questions storage error:', err)
    // Fall back to the hardcoded defaults so the survey never breaks.
    return ALL_QUESTIONS
  }
}

// Patch the editable fields of one question. Returns the updated row, or null if
// the id doesn't exist. Axis and id are intentionally not editable.
export async function updateQuestion(
  id: string,
  fields: { text: string; short: string; weight: number }
): Promise<Question | null> {
  const sql = getSql()
  await initQuestionsDb()
  const rows = await sql`
    UPDATE questions
    SET text = ${fields.text}, short = ${fields.short}, weight = ${fields.weight}
    WHERE id = ${id}
    RETURNING id, axis, weight, text, short
  `
  if (rows.length === 0) return null
  const r = rows[0]
  return {
    id: r.id as string,
    axis: r.axis as 'x' | 'y',
    weight: Number(r.weight),
    text: r.text as string,
    short: r.short as string,
  }
}
