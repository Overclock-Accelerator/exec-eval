import { NextResponse } from 'next/server'
import { getAllResponses } from '@/lib/storage'

export async function GET() {
  try {
    const responses = await getAllResponses()
    return NextResponse.json({ responses })
  } catch (err) {
    console.error('Responses fetch error:', err)
    return NextResponse.json({ responses: [] })
  }
}
