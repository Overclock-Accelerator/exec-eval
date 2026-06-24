'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
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
  const [showQr, setShowQr] = useState(false)
  const [surveyUrl, setSurveyUrl] = useState('https://exec-eval.vercel.app/')
  const pinRef = useRef('')

  useEffect(() => {
    setSurveyUrl(window.location.origin + '/')
  }, [])

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
          <div className="flex items-center gap-4">
            <span className="text-sm text-mute tabular-nums">
              {loading ? 'Loading…' : `${responses.length} response${responses.length !== 1 ? 's' : ''}`}
            </span>
            <button
              onClick={() => setShowQr(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal/40 text-teal hover:bg-teal/10 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3M20 14v.01M14 20h.01M17 20h.01M20 17v3" />
              </svg>
              Show QR
            </button>
          </div>
        }
      />

      {/* QR overlay — for collecting responses live, then dismiss to reveal */}
      {showQr && (
        <div
          onClick={() => setShowQr(false)}
          className="fixed inset-0 z-50 dot-grid flex flex-col items-center justify-center cursor-pointer"
        >
          <p className="text-xs tracking-[0.25em] uppercase text-amber mb-4">AI Readiness Check</p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-10">
            Scan to <span className="text-teal">begin</span>
          </h2>
          <div className="bg-white p-6 rounded-2xl">
            <QRCodeSVG value={surveyUrl} size={340} level="M" marginSize={0} />
          </div>
          <p className="mt-8 text-mute text-sm">
            {surveyUrl.replace(/^https?:\/\//, '')}
          </p>
          <p className="mt-6 text-[#3a3f47] text-xs">Click anywhere to close</p>
        </div>
      )}

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
