import { CalendarDays, Compass, Swords, Trophy, UserRound } from 'lucide-react'
import { useApp, type ActiveView } from '@/lib/store'

const ITEMS: { view: ActiveView; label: string; Icon: typeof Compass }[] = [
  { view: 'dashboard', label: 'Explore', Icon: Compass },
  { view: 'battle', label: '1v1 Battle', Icon: Swords },
  { view: 'events', label: 'Events', Icon: CalendarDays },
  { view: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
  { view: 'profile', label: 'Profile', Icon: UserRound },
]

/** Explore stays highlighted while browsing subjects. */
function isActive(item: ActiveView, current: ActiveView) {
  return item === current || (item === 'dashboard' && current === 'subject_select')
}

export function BottomNav() {
  const { state, navigate } = useApp()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="glass mx-auto flex max-w-lg items-stretch justify-between rounded-[1.75rem] p-1.5">
        {ITEMS.map(({ view, label, Icon }) => {
          const active = isActive(view, state.activeView)
          return (
            <li key={view} className="flex-1">
              <button
                onClick={() => navigate(view)}
                aria-current={active ? 'page' : undefined}
                className={`pop flex w-full flex-col items-center gap-0.5 rounded-2xl py-2 text-[10.5px] font-bold transition-colors ${
                  active ? 'bg-gradient-to-b from-honey-light to-honey text-ink shadow-[0_6px_14px_-6px_rgb(245_166_35/0.9)]' : 'text-ink/50 hover:text-ink'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} strokeWidth={active ? 2.4 : 2} />
                <span className="truncate">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
