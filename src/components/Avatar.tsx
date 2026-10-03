interface AvatarProps {
  emoji: string
  size?: number
  ring?: string
  className?: string
}

export function Avatar({ emoji, size = 44, ring = '#F5A623', className = '' }: AvatarProps) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-white to-amber-50 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.52, boxShadow: `0 0 0 3px ${ring}, 0 6px 16px -6px rgb(29 33 41 / .35)` }}
    >
      <span aria-hidden="true">{emoji}</span>
    </span>
  )
}

export function formatNum(n: number): string {
  return n.toLocaleString('en-US')
}
