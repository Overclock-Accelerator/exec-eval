'use client'

interface Point {
  x: number
  y: number
}

interface QuadrantChartProps {
  points: Point[]
  mode: 'individual' | 'average'
}

// Map a 0-10 score value to SVG coordinates
// Plot area: x from 80 to 480, y from 480 to 80 (inverted)
const toSvgX = (val: number) => 80 + (val / 10) * 400
const toSvgY = (val: number) => 480 - (val / 10) * 400

function jitter(points: Point[]): Point[] {
  const result: Point[] = []
  for (const p of points) {
    let ox = 0
    let oy = 0
    for (const existing of result) {
      const dx = p.x - existing.x
      const dy = p.y - existing.y
      if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
        ox += 0.35
        oy += 0.35
      }
    }
    result.push({ x: p.x + ox, y: p.y + oy })
  }
  return result
}

export default function QuadrantChart({ points, mode }: QuadrantChartProps) {
  const avgX =
    points.length > 0
      ? points.reduce((s, p) => s + p.x, 0) / points.length
      : 5
  const avgY =
    points.length > 0
      ? points.reduce((s, p) => s + p.y, 0) / points.length
      : 5

  const jitteredPoints = jitter(points)
  const ticks = [0, 2, 4, 6, 8, 10]

  return (
    <svg
      viewBox="0 0 560 560"
      className="w-full max-w-[560px] mx-auto"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Background */}
      <rect x="80" y="80" width="400" height="400" fill="#fafafa" stroke="#e5e7eb" strokeWidth="1" />

      {/* Subtle grid lines */}
      {ticks.slice(1, -1).map((t) => (
        <g key={t}>
          <line
            x1={toSvgX(t)} y1={80} x2={toSvgX(t)} y2={480}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,4"
          />
          <line
            x1={80} y1={toSvgY(t)} x2={480} y2={toSvgY(t)}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,4"
          />
        </g>
      ))}

      {/* Center crosshairs */}
      <line x1={toSvgX(5)} y1={80} x2={toSvgX(5)} y2={480} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={80} y1={toSvgY(5)} x2={480} y2={toSvgY(5)} stroke="#9ca3af" strokeWidth="1.5" />

      {/* Quadrant labels */}
      <text x="350" y="112" textAnchor="middle" fill="#d1d5db" fontSize="13" fontWeight="500">AI Leader</text>
      <text x="160" y="112" textAnchor="middle" fill="#d1d5db" fontSize="13" fontWeight="500">Theorist</text>
      <text x="350" y="468" textAnchor="middle" fill="#d1d5db" fontSize="13" fontWeight="500">Practitioner</text>
      <text x="160" y="468" textAnchor="middle" fill="#d1d5db" fontSize="13" fontWeight="500">Early Explorer</text>

      {/* Axis tick labels */}
      {ticks.map((t) => (
        <g key={t}>
          <text x={toSvgX(t)} y={498} textAnchor="middle" fill="#9ca3af" fontSize="11">{t}</text>
          <text x={72} y={toSvgY(t) + 4} textAnchor="end" fill="#9ca3af" fontSize="11">{t}</text>
        </g>
      ))}

      {/* Axis labels */}
      <text x="280" y="530" textAnchor="middle" fill="#6b7280" fontSize="13">Experimentation →</text>
      <text
        x="22"
        y="280"
        textAnchor="middle"
        fill="#6b7280"
        fontSize="13"
        transform="rotate(-90, 22, 280)"
      >
        ↑ Conceptual Understanding
      </text>

      {/* Data points */}
      {mode === 'individual' &&
        jitteredPoints.map((p, i) => (
          <circle
            key={i}
            cx={toSvgX(p.x)}
            cy={toSvgY(p.y)}
            r="9"
            fill="#1a1a1a"
            fillOpacity="0.65"
            stroke="white"
            strokeWidth="1.5"
          />
        ))}

      {mode === 'average' && points.length > 0 && (
        <>
          <circle
            cx={toSvgX(avgX)}
            cy={toSvgY(avgY)}
            r="16"
            fill="#f97316"
            stroke="white"
            strokeWidth="2"
          />
          <text
            x={toSvgX(avgX)}
            y={toSvgY(avgY) + 30}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="11"
          >
            {avgX.toFixed(1)}, {avgY.toFixed(1)}
          </text>
        </>
      )}

      {mode === 'average' && points.length === 0 && (
        <text x="280" y="280" textAnchor="middle" fill="#d1d5db" fontSize="14">
          No responses yet
        </text>
      )}
    </svg>
  )
}
