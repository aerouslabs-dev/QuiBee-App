import { DEVELOPER } from '@/data/fixtures'

export function DevCredit({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      Developed by{' '}
      <a
        href={DEVELOPER.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-sky underline decoration-sky/30 underline-offset-2 hover:decoration-sky"
      >
        {DEVELOPER.name}
      </a>
    </span>
  )
}
