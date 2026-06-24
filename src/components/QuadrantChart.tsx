'use client'

interface Point {
  x: number
  y: number
}

interface QuadrantChartProps {
  points: Point[]
  mode: 'individual' | 'average'
}

// Plot area: x from 80→480, y from 480→80 (inverted), on a 560×560 canvas.
const toSvgX = (val: number) => 80 + (val / 10) * 400
const toSvgY = (val: number) => 480 - (val / 10) * 400

function jitter(points: Point[]): Point[] {
  const result: Point[] = []
  for (const p of points) {
    let ox = 0
    let oy = 0
    for (const existing of result) {
      const dx = p.x + ox - existing.x
      const dy = p.y + oy - existing.y
      if (Math.abs(dx) < 0.45 && Math.abs(dy) < 0.45) {
        ox += 0.32
        oy -= 0.28
      }
    }
    result.push({ x: p.x + ox, y: p.y + oy })
  }
  return result
}

export default function QuadrantChart({ points, mode }: QuadrantChartProps) {
  const avgX = points.length > 0 ? points.reduce((s, p) => s + p.x, 0) / points.length : 5
  const avgY = points.length > 0 ? points.reduce((s, p) => s + p.y, 0) / points.length : 5

  const jittered = jitter(points)
  const ticks = [0, 2, 4, 6, 8, 10]
  const showIndividuals = mode === 'individual'

  return (
    <svg
      viewBox="0 0 560 560"
      className="w-full max-w-[620px] mx-auto"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <defs>
        <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2de3c7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2de3c7" stopOpacity="0.55" />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Plot background */}
      <rect x="80" y="80" width="400" height="400" fill="#0c0d0f" stroke="#1c1f24" strokeWidth="1" rx="4" />

      {/* Grid */}
      {ticks.slice(1, -1).map((t) => (
        <g key={t}>
          <line x1={toSvgX(t)} y1={80} x2={toSvgX(t)} y2={480} stroke="#16181c" strokeWidth="1" />
          <line x1={80} y1={toSvgY(t)} x2={480} y2={toSvgY(t)} stroke="#16181c" strokeWidth="1" />
        </g>
      ))}

      {/* Center crosshairs */}
      <line x1={toSvgX(5)} y1={80} x2={toSvgX(5)} y2={480} stroke="#2a2e35" strokeWidth="1.5" />
      <line x1={80} y1={toSvgY(5)} x2={480} y2={toSvgY(5)} stroke="#2a2e35" strokeWidth="1.5" />

      {/* Quadrant labels */}
      <text x="350" y="110" textAnchor="middle" fill="#3a3f47" fontSize="13" fontWeight="600">AI Leader</text>
      <text x="160" y="110" textAnchor="middle" fill="#3a3f47" fontSize="13" fontWeight="600">Theorist</text>
      <text x="350" y="466" textAnchor="middle" fill="#3a3f47" fontSize="13" fontWeight="600">Practitioner</text>
      <text x="160" y="466" textAnchor="middle" fill="#3a3f47" fontSize="13" fontWeight="600">Early Explorer</text>

      {/* Tick labels */}
      {ticks.map((t) => (
        <g key={t}>
          <text x={toSvgX(t)} y={500} textAnchor="middle" fill="#5a5f68" fontSize="11">{t}</text>
          <text x={70} y={toSvgY(t) + 4} textAnchor="end" fill="#5a5f68" fontSize="11">{t}</text>
        </g>
      ))}

      {/* Axis titles */}
      <text x="280" y="532" textAnchor="middle" fill="#8a8f98" fontSize="13" fontWeight="500">
        Experimentation →
      </text>
      <text
        x="28" y="280" textAnchor="middle" fill="#8a8f98" fontSize="13" fontWeight="500"
        transform="rotate(-90, 28, 280)"
      >
        Conceptual Understanding →
      </text>

      {/* Individual dots (full in individual mode, faint behind the average) */}
      {jittered.map((p, i) => (
        <circle
          key={i}
          cx={toSvgX(p.x)}
          cy={toSvgY(p.y)}
          r={showIndividuals ? 8.5 : 5}
          fill="url(#dotGlow)"
          stroke="#9ff5e6"
          strokeWidth={showIndividuals ? 1.2 : 0.6}
          opacity={showIndividuals ? 1 : 0.28}
          style={{
            animation: `dot-in 0.45s cubic-bezier(.2,.7,.3,1.4) both`,
            animationDelay: `${Math.min(i * 60, 1200)}ms`,
            transformOrigin: `${toSvgX(p.x)}px ${toSvgY(p.y)}px`,
          }}
        />
      ))}

      {/* Group average marker */}
      {mode === 'average' && points.length > 0 && (
        <g style={{ animation: 'dot-in 0.5s cubic-bezier(.2,.7,.3,1.4) both', animationDelay: '300ms', transformOrigin: `${toSvgX(avgX)}px ${toSvgY(avgY)}px` }}>
          <circle cx={toSvgX(avgX)} cy={toSvgY(avgY)} r="15" fill="#f2a93b" filter="url(#softGlow)" stroke="#000" strokeWidth="2" />
          <text x={toSvgX(avgX)} y={toSvgY(avgY) - 24} textAnchor="middle" fill="#f2a93b" fontSize="12" fontWeight="600">
            Room average
          </text>
          <text x={toSvgX(avgX)} y={toSvgY(avgY) + 32} textAnchor="middle" fill="#8a8f98" fontSize="11" className="tabular-nums">
            {avgX.toFixed(1)}, {avgY.toFixed(1)}
          </text>
        </g>
      )}

      {points.length === 0 && (
        <text x="280" y="285" textAnchor="middle" fill="#3a3f47" fontSize="14">
          Waiting for the first response…
        </text>
      )}
    </svg>
  )
}
