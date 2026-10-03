import { LogoMark, Wordmark } from './Logo'
import { DevCredit } from './DevCredit'

export function Footer() {
  return (
    <footer className="mx-auto mt-12 max-w-5xl px-4 pb-32 text-center">
      <div className="glass inline-flex flex-col items-center gap-1 rounded-3xl px-6 py-4">
        <span className="flex items-center gap-2">
          <LogoMark size={22} />
          <Wordmark className="text-base" />
          <span className="text-xs text-ink/40">· The Buzzing Brain Game</span>
        </span>
        <DevCredit className="text-xs text-ink/60" />
        <span className="text-[10px] text-ink/40">© {new Date().getFullYear()} QuiBee. All rights reserved.</span>
      </div>
    </footer>
  )
}
