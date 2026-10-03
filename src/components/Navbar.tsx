import { Flame, Hexagon, LogOut } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Avatar, formatNum } from './Avatar'
import { LogoMark, Wordmark } from './Logo'
import { DevCredit } from './DevCredit'

export function Navbar() {
  const { state, dispatch, navigate, playerLevel } = useApp()
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <nav className="glass mx-auto flex max-w-5xl items-center gap-3 rounded-3xl px-3 py-2.5 sm:px-4">
        <button onClick={() => navigate('dashboard')} className="pop flex items-center gap-2" aria-label="QuiBee home">
          <LogoMark size={36} />
          <span className="flex flex-col items-start leading-none">
            <Wordmark className="text-xl" />
            <DevCredit className="hidden text-[10px] text-ink/50 sm:inline" />
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600" title="Win streak">
            <Flame className="h-3.5 w-3.5" /> {state.streak}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-honey/15 px-2.5 py-1 text-xs font-bold text-honey-deep" title="Total points">
            <Hexagon className="h-3.5 w-3.5 fill-honey text-honey" /> {formatNum(state.points)}
          </span>
          {state.user && (
            <>
              <button onClick={() => navigate('profile')} className="pop relative ml-1" aria-label="Your profile">
                <Avatar emoji={state.user.avatar} size={34} />
                <span className="absolute -right-1 -bottom-1 rounded-full bg-sky px-1.5 text-[10px] font-bold text-white ring-2 ring-white">
                  {playerLevel}
                </span>
              </button>
              <button
                onClick={() => dispatch({ type: 'SIGN_OUT' })}
                className="pop hidden rounded-full p-2 text-ink/40 hover:bg-ink/5 hover:text-ink sm:block"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
