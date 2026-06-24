import { NextResponse } from 'next/server'
import { getQuestions, updateQuestion } from '@/lib/storage'

export async function GET() {
  try {
    const questions = await getQuestions()
    return NextResponse.json({ questions })
  } catch (err) {
    console.error('Questions fetch error:', err)
    return NextResponse.json({ questions: [] })
  }
}

// PATCH { id, text, short, weight } — edit one question's editable fields.
// Axis and the set of questions are fixed, so there's no add/delete here.
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id } = body ?? {}
    const text = typeof body?.text === 'string' ? body.text.trim() : ''
    const short = typeof body?.short === 'string' ? body.short.trim() : ''
    const weight = Number(body?.weight)

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing question id.' }, { status: 400 })
    }
    if (!text || !short) {
      return NextResponse.json({ error: 'Text and short label are required.' }, { status: 400 })
    }
    if (!Number.isInteger(weight) || weight < 1 || weight > 10) {
      return NextResponse.json(
        { error: 'Weight must be a whole number between 1 and 10.' },
        { status: 400 }
      )
    }

    const updated = await updateQuestion(id, { text, short, weight })
    if (!updated) {
      return NextResponse.json({ error: `No question with id "${id}".` }, { status: 404 })
    }
    return NextResponse.json({ success: true, question: updated })
  } catch (err) {
    console.error('Question update error:', err)
    return NextResponse.json({ error: 'Failed to update question. Check server logs.' }, { status: 500 })
  }
}
