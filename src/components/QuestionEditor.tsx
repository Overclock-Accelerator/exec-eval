'use client'

import { useState } from 'react'
import { type Question } from '@/lib/questions'

type Status = 'idle' | 'saving' | 'saved' | 'error'

function EditorRow({
  question,
  accent,
  onSaved,
}: {
  question: Question
  accent: string
  onSaved: (q: Question) => void
}) {
  const [text, setText] = useState(question.text)
  const [short, setShort] = useState(question.short)
  const [weight, setWeight] = useState(String(question.weight))
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const dirty =
    text !== question.text ||
    short !== question.short ||
    weight !== String(question.weight)

  async function save() {
    if (status === 'saving') return
    const w = Number(weight)
    if (!text.trim() || !short.trim()) {
      setStatus('error')
      setErrorMsg('Text and short label are required.')
      return
    }
    if (!Number.isInteger(w) || w < 1 || w > 10) {
      setStatus('error')
      setErrorMsg('Weight must be a whole number 1–10.')
      return
    }
    setStatus('saving')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: question.id, text: text.trim(), short: short.trim(), weight: w }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setStatus('saved')
      onSaved(data.question as Question)
      setTimeout(() => setStatus('idle'), 1800)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Save failed')
    }
  }

  return (
    <div className="py-4 border-b border-line/60 last:border-b-0">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider tabular-nums px-1.5 py-0.5 rounded"
          style={{ color: accent, backgroundColor: `${accent}1a` }}
        >
          {question.id}
        </span>
        <input
          value={short}
          onChange={(e) => setShort(e.target.value)}
          placeholder="Short label"
          className="flex-1 bg-surface border border-line rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-[#3a3f47] focus:border-mute focus:outline-none"
        />
        <label className="flex items-center gap-1.5 text-xs text-mute shrink-0">
          weight
          <input
            type="number"
            min={1}
            max={10}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-14 bg-surface border border-line rounded-lg px-2 py-1.5 text-sm text-white tabular-nums focus:border-mute focus:outline-none"
          />
        </label>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Question text"
        className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-gray-200 leading-relaxed placeholder:text-[#3a3f47] focus:border-mute focus:outline-none resize-y"
      />

      <div className="flex items-center justify-between mt-2 min-h-[28px]">
        <span className="text-xs">
          {status === 'error' && <span className="text-amber">{errorMsg}</span>}
          {status === 'saved' && <span className="text-teal">Saved ✓</span>}
        </span>
        <button
          onClick={save}
          disabled={!dirty || status === 'saving'}
          className="px-3 py-1.5 rounded-lg border border-line text-mute hover:text-white hover:border-mute transition-colors text-xs disabled:opacity-40 disabled:hover:text-mute disabled:hover:border-line"
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default function QuestionEditor({
  questions,
  onSaved,
}: {
  questions: Question[]
  onSaved?: (q: Question) => void
}) {
  const xQuestions = questions.filter((q) => q.axis === 'x')
  const yQuestions = questions.filter((q) => q.axis === 'y')

  const handleSaved = (q: Question) => onSaved?.(q)

  return (
    <div className="w-full max-w-5xl mx-auto">
      <p className="text-xs text-mute mb-5 text-center">
        Edit the live survey. Text and short labels apply to new respondents immediately;
        weight changes affect scoring for <span className="text-gray-300">future</span> submissions
        only — responses already collected keep their scores.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        <div>
          <div className="flex items-center gap-2 mb-1 pb-2 border-b border-line sticky top-0 bg-ink z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-teal" />
            <h3 className="text-sm font-semibold text-white">Experimentation</h3>
            <span className="text-xs text-mute ml-auto">X axis</span>
          </div>
          {xQuestions.map((q) => (
            <EditorRow key={q.id} question={q} accent="#2de3c7" onSaved={handleSaved} />
          ))}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1 pb-2 border-b border-line sticky top-0 bg-ink z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-amber" />
            <h3 className="text-sm font-semibold text-white">Conceptual Understanding</h3>
            <span className="text-xs text-mute ml-auto">Y axis</span>
          </div>
          {yQuestions.map((q) => (
            <EditorRow key={q.id} question={q} accent="#f2a93b" onSaved={handleSaved} />
          ))}
        </div>
      </div>
    </div>
  )
}
