import { LogoMark, Wordmark } from './Logo'
import { DevCredit } from './DevCredit'

export function SplashScreen({ leaving }: { leaving: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#fdf3dc] ${leaving ? 'fade-out' : ''}`}
      role="status"
      aria-label="Loading QuiBee"
    >
      <div className="honeycomb honey-pulse absolute inset-0" />
      <div className="absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-honey/40 blur-3xl" />
      <div className="absolute -right-40 -bottom-40 h-[30rem] w-[30rem] rounded-full bg-sky/30 blur-3xl" />

      <div className="relative flex flex-col items-center px-8 text-center">
        <div className="logo-in">
          <div className="float drop-shadow-[0_20px_30px_rgba(245,166,35,0.45)]">
            <LogoMark size={128} />
          </div>
        </div>
        <Wordmark className="rise mt-6 text-6xl text-ink" />
        <p className="rise mt-2 text-sm font-semibold tracking-[0.25em] text-ink/60 uppercase" style={{ animationDelay: '0.15s' }}>
          The Buzzing Brain Game
        </p>

        <div className="rise mt-10 w-64" style={{ animationDelay: '0.3s' }}>
          <div className="glass h-2.5 overflow-hidden rounded-full p-0.5">
            <div className="boot-bar h-full rounded-full bg-gradient-to-r from-honey-light via-honey to-sky" />
          </div>
          <p className="mt-3 font-mono text-xs text-ink/55">Initializing Hive Engine…</p>
        </div>
      </div>

      <DevCredit className="absolute bottom-8 text-xs text-ink/55" />
    </div>
  )
}
