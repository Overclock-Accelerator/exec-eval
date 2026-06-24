'use client'

import { ALL_QUESTIONS, type Question } from '@/lib/questions'

interface Resp {
  answers: Record<string, number>
}

function avgFor(q: Question, responses: Resp[]): number | null {
  const vals = responses
    .map((r) => r.answers?.[q.id])
    .filter((v): v is number => typeof v === 'number')
  if (vals.length === 0) return null
  return vals.reduce((s, v) => s + v, 0) / vals.length
}

function Row({ q, responses, accent }: { q: Question; responses: Resp[]; accent: string }) {
  const avg = avgFor(q, responses)
  const pct = avg ? (avg / 5) * 100 : 0
  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-sm text-gray-200 truncate">{q.short}</span>
        <span className="text-xs text-mute tabular-nums shrink-0">
          {avg ? avg.toFixed(1) : '—'}
          <span className="text-[#3a3f47]"> / 5</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-line/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  )
}

export default function QuestionBreakdown({
  responses,
  questions = ALL_QUESTIONS,
}: {
  responses: Resp[]
  questions?: Question[]
}) {
  const xQuestions = questions.filter((q) => q.axis === 'x')
  const yQuestions = questions.filter((q) => q.axis === 'y')
  return (
    <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
      <div>
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-line">
          <span className="w-2.5 h-2.5 rounded-full bg-teal" />
          <h3 className="text-sm font-semibold text-white">Experimentation</h3>
          <span className="text-xs text-mute ml-auto">easy → hard</span>
        </div>
        {xQuestions.map((q) => (
          <Row key={q.id} q={q} responses={responses} accent="#2de3c7" />
        ))}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-line">
          <span className="w-2.5 h-2.5 rounded-full bg-amber" />
          <h3 className="text-sm font-semibold text-white">Conceptual Understanding</h3>
          <span className="text-xs text-mute ml-auto">easy → hard</span>
        </div>
        {yQuestions.map((q) => (
          <Row key={q.id} q={q} responses={responses} accent="#f2a93b" />
        ))}
      </div>
    </div>
  )
}
