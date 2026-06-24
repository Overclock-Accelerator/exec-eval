import { NextResponse } from 'next/server'
import { calculateScores, type Question } from '@/lib/questions'
import { getQuestions, saveResponse } from '@/lib/storage'

// Generate plausible exec-audience answers. Most respondents are early on the
// journey (low answers, especially on the harder/higher-weight questions), with
// a few more-advanced outliers — so the demo reveal clusters bottom-left, the
// way a real room of pre-AI execs is expected to.
function sampleAnswer(q: Question, advanced: boolean): number {
  // Easier questions (weight 1) skew higher; hardest (weight 5) skew lowest.
  const base = advanced ? 3.4 : 2.3
  const target = base - (q.weight - 1) * (advanced ? 0.35 : 0.42)
  const noise = (Math.random() - 0.5) * 1.6
  return Math.max(1, Math.min(5, Math.round(target + noise)))
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const n = Math.max(1, Math.min(60, Number(searchParams.get('n')) || 20))

    const questions = await getQuestions()

    let saved = 0
    for (let i = 0; i < n; i++) {
      const advanced = Math.random() < 0.15
      const answers: Record<string, number> = {}
      for (const q of questions) answers[q.id] = sampleAnswer(q, advanced)
      const { x, y } = calculateScores(answers, questions)
      await saveResponse(answers, x, y)
      saved++
    }
    return NextResponse.json({ success: true, seeded: saved })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: 'Failed to seed demo data.' }, { status: 500 })
  }
}
