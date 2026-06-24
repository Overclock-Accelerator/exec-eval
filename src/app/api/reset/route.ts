import { NextResponse } from 'next/server'
import { clearAllResponses } from '@/lib/storage'
import { pinOk, unauthorized } from '@/lib/auth'

export async function POST(req: Request) {
  if (!pinOk(req)) return unauthorized()
  try {
    await clearAllResponses()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset error:', err)
    return NextResponse.json({ error: 'Failed to clear responses.' }, { status: 500 })
  }
}
