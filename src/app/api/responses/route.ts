import { NextResponse } from 'next/server'
import { getAllResponses } from '@/lib/storage'
import { pinOk, unauthorized } from '@/lib/auth'

export async function GET(req: Request) {
  if (!pinOk(req)) return unauthorized()
  try {
    const responses = await getAllResponses()
    return NextResponse.json({ responses })
  } catch (err) {
    console.error('Responses fetch error:', err)
    return NextResponse.json({ responses: [] })
  }
}
