import { neon } from '@neondatabase/serverless'
import { v4 as uuidv4 } from 'uuid'

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
