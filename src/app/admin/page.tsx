'use client'

import { useCallback, useEffect, useState } from 'react'
import QuadrantChart from '@/components/QuadrantChart'
import QuestionBreakdown from '@/components/QuestionBreakdown'
import { HeaderBar } from '@/components/Brand'

interface Response {
  id: string
  x: number
  y: number
  answers: Record<string, number>
  submittedAt: string
}

type ViewMode = 'individual' | 'average' | 'questions'

const TABS: { key: ViewMode; label: string }[] = [
  { key: 'individual', label: 'All Respondents' },
  { key: 'average', label: 'Room Average' },
  { key: 'questions', label: 'By Question' },
]

export default function AdminPage() {
  const [responses, setResponses] = useState<Response[]>([])
  const [mode, setMode] = useState<ViewMode>('individual')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const fetchResponses = useCallback(async () => {
    try {
      const res = await fetch('/api/responses')
      const data = await res.json()
      setResponses(data.responses ?? [])
    } catch {
      // keep last known data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResponses()
    const interval = setInterval(fetchResponses, 5000)
    return () => clearInterval(interval)
  }, [fetchResponses])

  async function seed() {
    if (busy) return
    setBusy(true)
    try {
      await fetch('/api/seed?n=20', { method: 'POST' })
      await fetchResponses()
    } finally {
      setBusy(false)
    }
  }

  async function clearAll() {
    if (busy) return
    if (!confirm('Delete ALL responses? This cannot be undone.')) return
    setBusy(true)
    try {
      await fetch('/api/reset', { method: 'POST' })
      await fetchResponses()
    } finally {
      setBusy(false)
    }
  }

  const points = responses.map((r) => ({ x: r.x, y: r.y }))

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <HeaderBar
        lead="AI Readiness"
        title="· Live Admin"
        right={
          <span className="text-sm text-mute tabular-nums">
            {loading ? 'Loading…' : `${responses.length} response${responses.length !== 1 ? 's' : ''}`}
          </span>
        }
      />

      {/* Tabs */}
      <div className="px-6 pt-5 flex justify-center">
        <div className="inline-flex rounded-xl border border-line overflow-hidden bg-surface">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setMode(t.key)}
              className={`px-4 sm:px-5 py-2 text-sm font-medium transition-colors ${
                mode === t.key
                  ? 'bg-teal text-ink'
                  : 'text-mute hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main view */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        {mode === 'questions' ? (
          responses.length === 0 ? (
            <p className="text-[#3a3f47] text-sm">No responses yet.</p>
          ) : (
            <QuestionBreakdown responses={responses} />
          )
        ) : (
          <div className="w-full max-w-2xl">
            <QuadrantChart points={points} mode={mode === 'average' ? 'average' : 'individual'} />
          </div>
        )}
      </div>

      {/* Presentation controls */}
      <div className="border-t border-line px-6 py-3 flex items-center justify-between text-xs">
        <span className="text-[#3a3f47]">Auto-refreshes every 5s · /admin</span>
        <div className="flex items-center gap-2">
          <button
            onClick={seed}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg border border-line text-mute hover:text-white hover:border-mute transition-colors disabled:opacity-40"
          >
            + Demo data
          </button>
          <button
            onClick={clearAll}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg border border-line text-mute hover:text-amber hover:border-amber/50 transition-colors disabled:opacity-40"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}
