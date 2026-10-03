import { useId } from 'react'

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFC94D" />
          <stop offset="1" stopColor="#F5A623" />
        </linearGradient>
      </defs>
      <path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill={`url(#${id})`} />
      <path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" />
      <ellipse cx="22" cy="24" rx="9" ry="6" fill="#2B8CBE" opacity=".85" transform="rotate(-25 22 24)" />
      <ellipse cx="42" cy="24" rx="9" ry="6" fill="#2B8CBE" opacity=".85" transform="rotate(25 42 24)" />
      <ellipse cx="32" cy="38" rx="10" ry="13" fill="#1D2129" />
      <path d="M22.5 34h19M22 40h20M24 46h16" stroke="#F5A623" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="32" cy="22" r="6" fill="#1D2129" />
      <circle cx="30" cy="21" r="1.4" fill="#fff" />
      <circle cx="34.2" cy="21" r="1.4" fill="#fff" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      Qui<span className="text-honey">Bee</span>
    </span>
  )
}
