'use client'

import { useEffect, useState } from 'react'
import QuadrantChart from '@/components/QuadrantChart'

interface Response {
  id: string
  x: number
  y: number
  submittedAt: string
}

type ViewMode = 'individual' | 'average'

export default function AdminPage() {
  const [responses, setResponses] = useState<Response[]>([])
  const [mode, setMode] = useState<ViewMode>('individual')
  const [loading, setLoading] = useState(true)

  async function fetchResponses() {
    try {
      const res = await fetch('/api/responses')
      const data = await res.json()
      setResponses(data.responses ?? [])
    } catch {
      // silent — keep showing last known data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResponses()
    const interval = setInterval(fetchResponses, 10000)
    return () => clearInterval(interval)
  }, [])

  const points = responses.map((r) => ({ x: r.x, y: r.y }))

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900">AI Readiness — Admin</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${responses.length} response${responses.length !== 1 ? 's' : ''} recorded`}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setMode('individual')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'individual'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Respondents
          </button>
          <button
            onClick={() => setMode('average')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
              mode === 'average'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Group Average
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <QuadrantChart points={points} mode={mode} />
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-300 text-center">
        Refreshes every 10 seconds · /admin
      </div>
    </div>
  )
}
