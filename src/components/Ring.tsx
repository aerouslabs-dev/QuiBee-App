import type { ReactNode } from 'react'

interface RingProps {
  /** 0 → 1 */
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  children?: ReactNode
  /** CSS transition for the arc; pass 'linear' for ticking timers */
  motion?: 'smooth' | 'linear'
}

/** Animated SVG progress ring used for timers, accuracy and subject progress. */
export function Ring({ value, size = 64, stroke = 6, color = '#F5A623', track = 'rgb(29 33 41 / 0.08)', children, motion = 'smooth' }: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, value))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{
            transition:
              motion === 'smooth'
                ? 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1), stroke 0.3s'
                : 'stroke-dashoffset 0.1s linear, stroke 0.3s',
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
