import { useMemo, useState } from 'react'
import { Crown, Hexagon } from 'lucide-react'
import { PLAYERS } from '@/data/fixtures'
import { useApp } from '@/lib/store'
import { Avatar, formatNum } from './Avatar'

interface Row {
  id: string
  name: string
  avatar: string
  level: number
  points: number
  country: string
  isMe?: boolean
}

const PODIUM = [
  { place: 2, color: '#C0C7D1', label: 'Silver', height: 'h-24', size: 64 },
  { place: 1, color: '#F5A623', label: 'Gold', height: 'h-32', size: 80 },
  { place: 3, color: '#CD7F32', label: 'Bronze', height: 'h-20', size: 60 },
]

export function Leaderboard() {
  const { state, dispatch, playerLevel } = useApp()
  const [scope, setScope] = useState<'global' | 'following'>('global')

  const rows = useMemo<Row[]>(() => {
    const me: Row | null = state.user
      ? { id: 'me', name: state.user.name, avatar: state.user.avatar, level: playerLevel, points: state.points, country: '🐝', isMe: true }
      : null
    const others = PLAYERS.filter((p) => scope === 'global' || state.following.includes(p.id))
    return [...others, ...(me ? [me] : [])].sort((a, b) => b.points - a.points)
  }, [state.user, state.points, state.following, playerLevel, scope])

  const top = rows.slice(0, 3)
  const open = (id: string) => dispatch({ type: 'VIEW_PROFILE', id })

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold">Leaderboard</h1>
          <p className="text-sm text-ink/55">The sharpest minds in the hive this season.</p>
        </div>
        <div className="glass flex rounded-2xl p-1 text-xs font-bold">
          {(['global', 'following'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`pop rounded-xl px-3 py-1.5 capitalize ${scope === s ? 'bg-ink text-white' : 'text-ink/50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-sm text-ink/55">
          You aren’t following anyone yet. Visit a player’s profile and tap <b>Follow</b>.
        </div>
      ) : (
        <>
          {/* Podium */}
          <section className="glass relative overflow-hidden rounded-[2rem] px-4 pt-8">
            <div className="honeycomb absolute inset-0 opacity-70" />
            <div className="relative grid grid-cols-3 items-end gap-2 sm:gap-6">
              {PODIUM.map(({ place, color, label, height, size }) => {
                const p = top[place - 1]
                if (!p) return <div key={place} />
                return (
                  <button key={place} onClick={() => !p.isMe && open(p.id)} className="pop rise flex flex-col items-center" style={{ animationDelay: `${place * 0.1}s` }}>
                    <Crown className="crown-bob mb-1 h-7 w-7" style={{ color, fill: color }} />
                    <Avatar emoji={p.avatar} size={size} ring={color} />
                    <p className="mt-2 max-w-full truncate text-sm font-bold">{p.isMe ? 'You' : p.name.split(' ')[0]}</p>
                    <p className="flex items-center gap-1 text-xs font-bold text-ink/55">
                      <Hexagon className="h-3 w-3 fill-honey text-honey" />
                      {formatNum(p.points)}
                    </p>
                    <div
                      className={`mt-3 flex w-full ${height} flex-col items-center justify-start rounded-t-2xl pt-2 font-display text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]`}
                      style={{ background: `linear-gradient(180deg, ${color}, ${color}cc)` }}
                    >
                      <span className="text-3xl font-bold">{place}</span>
                      <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">{label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Ranking list */}
          <section className="glass overflow-hidden rounded-3xl">
            <ol>
              {rows.map((p, i) => (
                <li key={p.id} className="border-b border-ink/5 last:border-0">
                  <button
                    onClick={() => !p.isMe && open(p.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/50 ${p.isMe ? 'bg-honey/15' : ''}`}
                  >
                    <span className={`w-7 text-center font-display text-lg font-bold ${i < 3 ? 'text-honey-deep' : 'text-ink/35'}`}>{i + 1}</span>
                    <Avatar emoji={p.avatar} size={38} ring={p.isMe ? '#F5A623' : '#ffffff'} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">
                        {p.name} {p.isMe && <span className="ml-1 rounded-full bg-honey px-2 py-0.5 text-[10px] text-ink">YOU</span>}
                      </span>
                      <span className="text-xs text-ink/50">
                        {p.country} · Rank {p.level}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 font-display font-bold">
                      <Hexagon className="h-3.5 w-3.5 fill-honey text-honey" />
                      {formatNum(p.points)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  )
}
