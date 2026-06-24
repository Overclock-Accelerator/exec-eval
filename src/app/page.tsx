'use client'

import { useState } from 'react'
import { ALL_QUESTIONS } from '@/lib/questions'

const SCALE_LABELS: Record<number, string> = {
  1: 'Not at all',
  2: 'Barely / just starting',
  3: 'Somewhat',
  4: 'Meaningfully',
  5: 'Extensively',
}

export default function SurveyPage() {
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
  const partLabel =
    part === 1 ? 'Part 1 of 2: How you use AI' : 'Part 2 of 2: What you know about AI'

  function handleSelect(value: number) {
    setSelected(value)
  }

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div
          className="h-full bg-gray-900 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Meta */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
              {partLabel}
            </span>
            <span className="text-xs text-gray-400">
              {current + 1} of {total}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-xl font-medium text-gray-900 leading-relaxed mb-8">
            {question.text}
          </h2>

          {/* Answer options */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className={`w-full text-left px-5 py-4 rounded-lg border transition-all duration-150 ${
                  selected === value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className="text-sm font-medium mr-3 opacity-50">{value}</span>
                {SCALE_LABELS[value]}
              </button>
            ))}
          </div>

          {/* Next / Submit */}
          {selected !== null && (
            <div className="mt-6">
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button
                onClick={handleNext}
                disabled={submitting}
                className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : isLast ? 'Submit' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
