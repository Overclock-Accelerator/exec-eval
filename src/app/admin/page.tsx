'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QuadrantChart from '@/components/QuadrantChart'
import QuestionBreakdown from '@/components/QuestionBreakdown'
import { HeaderBar, Wordmark } from '@/components/Brand'

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

const PIN_KEY = 'execeval_pin'

export default function AdminPage() {
  const [authed, setAuthed] = useState<'checking' | 'no' | 'yes'>('checking')
  const [pin, setPin] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)

  const [responses, setResponses] = useState<Response[]>([])
  const [mode, setMode] = useState<ViewMode>('individual')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const pinRef = useRef('')

  // Always read responses with the current PIN attached.
  const fetchResponses = useCallback(async () => {
    try {
      const res = await fetch('/api/responses', {
        headers: { 'x-admin-pin': pinRef.current },
      })
      if (res.status === 401) {
        setAuthed('no')
        return false
      }
      const data = await res.json()
      setResponses(data.responses ?? [])
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // On mount, try the stored PIN (empty string works when the gate is off).
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(PIN_KEY) ?? '' : ''
    pinRef.current = stored
    fetchResponses().then((ok) => {
      if (ok) {
        setPin(stored)
        setAuthed('yes')
      } else {
        setAuthed('no')
      }
    })
  }, [fetchResponses])

  // Poll while authed.
  useEffect(() => {
    if (authed !== 'yes') return
    const interval = setInterval(fetchResponses, 5000)
    return () => clearInterval(interval)
  }, [authed, fetchResponses])

  async function submitPin(e: React.FormEvent) {
    e.preventDefault()
    setPinError(false)
    pinRef.current = pinInput
    const ok = await fetchResponses()
    if (ok) {
      localStorage.setItem(PIN_KEY, pinInput)
      setPin(pinInput)
      setAuthed('yes')
    } else {
      setPinError(true)
    }
  }

  async function seed() {
    if (busy) return
    setBusy(true)
    try {
      await fetch('/api/seed?n=20', { method: 'POST', headers: { 'x-admin-pin': pin } })
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
      await fetch('/api/reset', { method: 'POST', headers: { 'x-admin-pin': pin } })
      await fetchResponses()
    } finally {
      setBusy(false)
    }
  }

  // ---- PIN gate ----
  if (authed !== 'yes') {
    return (
      <div className="min-h-screen dot-grid flex flex-col">
        <div className="px-6 py-5">
          <Wordmark />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          {authed === 'checking' ? (
            <p className="text-mute text-sm">Loading…</p>
          ) : (
            <form onSubmit={submitPin} className="w-full max-w-xs text-center">
              <p className="text-xs tracking-[0.25em] uppercase text-amber mb-4">Admin</p>
              <h1 className="text-2xl font-semibold mb-6">Enter access PIN</h1>
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-center text-white tracking-widest focus:border-teal focus:outline-none"
                placeholder="••••"
              />
              {pinError && <p className="text-amber text-sm mt-3">Incorrect PIN.</p>}
              <button
                type="submit"
                className="mt-5 w-full bg-teal text-ink py-3.5 rounded-xl font-semibold hover:bg-teal/90 transition-colors"
              >
                Unlock
              </button>
            </form>
          )}
        </div>
      </div>
    )
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
                mode === t.key ? 'bg-teal text-ink' : 'text-mute hover:text-white'
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
