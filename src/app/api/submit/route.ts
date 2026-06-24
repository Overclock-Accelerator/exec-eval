import { NextResponse } from 'next/server'
import { calculateScores } from '@/lib/questions'
import { saveResponse } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    const { answers } = await req.json()
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400 })
    }
    const { x, y } = calculateScores(answers)
    const response = await saveResponse(answers, x, y)
    return NextResponse.json({ success: true, id: response.id, x, y })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Failed to save response. Check server logs.' }, { status: 500 })
  }
}
