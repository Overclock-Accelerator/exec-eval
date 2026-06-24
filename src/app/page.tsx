'use client'

import { useState } from 'react'
import { ALL_QUESTIONS } from '@/lib/questions'
import { Wordmark } from '@/components/Brand'

const SCALE_LABELS: Record<number, string> = {
  1: 'Not at all',
  2: 'Barely — just starting',
  3: 'Somewhat',
  4: 'Meaningfully',
  5: 'Extensively',
}

export default function SurveyPage() {
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const question = ALL_QUESTIONS[current]
  const total = ALL_QUESTIONS.length
  const progress = (current / total) * 100
  const isLast = current === total - 1
  const part = current < 8 ? 1 : 2
  const partLabel = part === 1 ? 'How you use AI' : 'What you know about AI'

  async function handleNext() {
    if (selected === null) return
    const updated = { ...answers, [question.id]: selected }
    setAnswers(updated)

    if (isLast) {
      setSubmitting(true)
      setError(null)
      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: updated }),
        })
        if (!res.ok) throw new Error('Submission failed')
        window.location.href = '/thank-you'
      } catch {
        setError('Something went wrong. Please try again.')
        setSubmitting(false)
      }
      return
    }

    setCurrent(current + 1)
    setSelected(null)
  }

  // ---- Intro screen ----
  if (!started) {
    return (
      <div className="min-h-screen dot-grid flex flex-col">
        <div className="px-6 py-5">
          <Wordmark />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md text-center" style={{ animation: 'fade-up 0.5s ease both' }}>
            <p className="text-xs tracking-[0.25em] uppercase text-amber mb-5">
              AI Readiness Check
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Where are you on the{' '}
              <span className="text-teal">AI journey?</span>
            </h1>
            <p className="text-mute mt-5 leading-relaxed">
              16 quick questions about how you use AI and what you understand
              about it. There are no wrong answers — be honest, this is your own
              baseline.
            </p>
            <div className="mt-6 flex items-center justify-center gap-5 text-xs text-mute">
              <span>16 questions</span>
              <span className="w-1 h-1 rounded-full bg-line" />
              <span>~5 minutes</span>
              <span className="w-1 h-1 rounded-full bg-line" />
              <span>Anonymous</span>
            </div>
            <button
              onClick={() => setStarted(true)}
              className="mt-9 w-full bg-teal text-ink py-4 rounded-xl font-semibold hover:bg-teal/90 transition-colors"
            >
              Begin →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Question screen ----
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-line/60">
        <div
          className="h-full bg-teal transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-6 pt-5">
        <Wordmark />
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div
          key={current}
          className="w-full max-w-xl"
          style={{ animation: 'fade-up 0.35s ease both' }}
        >
          {/* Meta */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber font-medium">
              Part {part} of 2 · {partLabel}
            </span>
            <span className="text-xs text-mute tabular-nums">
              {current + 1} / {total}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-xl sm:text-2xl font-medium text-white leading-snug mb-8">
            {question.text}
          </h2>

          {/* Answer options */}
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((value) => {
              const active = selected === value
              return (
                <button
                  key={value}
                  onClick={() => setSelected(value)}
                  className={`w-full flex items-center text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
                    active
                      ? 'bg-teal/12 border-teal text-white'
                      : 'bg-surface border-line text-gray-300 hover:border-mute'
                  }`}
                >
                  <span
                    className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold mr-3 ${
                      active
                        ? 'bg-teal text-ink'
                        : 'bg-line/60 text-mute'
                    }`}
                  >
                    {value}
                  </span>
                  <span className="text-sm sm:text-base">{SCALE_LABELS[value]}</span>
                </button>
              )
            })}
          </div>

          {/* Next / Submit */}
          <div className="mt-6 min-h-[60px]">
            {error && <p className="text-amber text-sm mb-3">{error}</p>}
            {selected !== null && (
              <button
                onClick={handleNext}
                disabled={submitting}
                className="w-full bg-teal text-ink py-4 rounded-xl font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : isLast ? 'See where I land →' : 'Next →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
