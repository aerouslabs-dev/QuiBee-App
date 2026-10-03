import { useMemo, type CSSProperties } from 'react'

const COLORS = ['#F5A623', '#FFC94D', '#2B8CBE', '#5FB3E0', '#22C55E', '#EC4899', '#ffffff']

/** CSS-only confetti burst; mount it to celebrate, unmount to clear. */
export function Confetti({ pieces = 90 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 2.2 + Math.random() * 1.8,
        dx: (Math.random() - 0.5) * 240,
        rot: 360 + Math.random() * 720,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.7,
      })),
    [pieces],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 block"
          style={
            {
              left: `${b.left}%`,
              width: b.w,
              height: b.round ? b.w : b.h,
              background: b.color,
              borderRadius: b.round ? '999px' : '2px',
              animationDelay: `${b.delay}s`,
              '--dur': `${b.dur}s`,
              '--dx': `${b.dx}px`,
              '--rot': `${b.rot}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
