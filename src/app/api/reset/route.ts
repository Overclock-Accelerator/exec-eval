import { NextResponse } from 'next/server'
import { clearAllResponses } from '@/lib/storage'

export async function POST() {
  try {
    await clearAllResponses()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset error:', err)
    return NextResponse.json({ error: 'Failed to clear responses.' }, { status: 500 })
  }
}
