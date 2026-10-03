import { useState } from 'react'
import { Hexagon, Search, Shuffle, Swords, Trophy, Zap } from 'lucide-react'
import { PLAYERS } from '@/data/fixtures'
import { useApp } from '@/lib/store'
import { Avatar, formatNum } from './Avatar'

export function Battle() {
  const { state, startQuiz, dispatch } = useApp()
  const [matching, setMatching] = useState(false)
  const friends = PLAYERS.filter((p) => state.following.includes(p.id))
  const pool = friends.length ? [...friends, ...PLAYERS.filter((p) => !friends.includes(p))] : PLAYERS
  const challenge = (opponentId: string) => startQuiz({ mode: 'battle', subjectId: 'gk', level: 1, opponentId })

  function quickMatch() {
    setMatching(true)
    const opp = PLAYERS[Math.floor(Math.random() * PLAYERS.length)]
    window.setTimeout(() => challenge(opp.id), 1600)
  }

  const total = state.wins + state.losses

  return (
    <div className="space-y-6">
      <section className="glass-dark relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="honeycomb absolute inset-0 opacity-50" />
        <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-honey/40 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-sky/50 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex items-center gap-5">
            <Avatar emoji={state.user?.avatar ?? '🐝'} size={72} />
            <span className={`grid h-14 w-14 place-items-center rounded-full bg-white/10 ${matching ? 'animate-spin' : ''}`}>
              <Swords className="h-7 w-7 text-honey" />
            </span>
            <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-white/10 text-3xl ring-3 ring-sky">{matching ? '…' : '?'}</span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold">1v1 Battle</h1>
          <p className="mt-1 max-w-sm text-sm text-white/60">
            7 rapid-fire questions, same set for both players. Fastest correct answers win — winner takes the points.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={quickMatch} disabled={matching} className="btn-honey pop flex items-center gap-2 rounded-2xl px-6 py-3.5 font-display text-lg font-bold disabled:opacity-80">
              {matching ? <Search className="h-5 w-5 animate-pulse" /> : <Shuffle className="h-5 w-5" />}
              {matching ? 'Finding opponent…' : 'Quick Match'}
            </button>
          </div>
          <div className="mt-6 flex gap-6 text-sm">
            <span>
              <b className="font-display text-xl text-honey">{state.wins}</b> <span className="text-white/50">wins</span>
            </span>
            <span>
              <b className="font-display text-xl text-sky-light">{state.losses}</b> <span className="text-white/50">losses</span>
            </span>
            <span>
              <b className="font-display text-xl">{total ? Math.round((state.wins / total) * 100) : 0}%</b> <span className="text-white/50">win rate</span>
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl font-bold">{friends.length ? 'Friends & rivals' : 'Challenge a rival'}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {pool.slice(0, 8).map((p, i) => {
            const isFriend = state.following.includes(p.id)
            return (
              <div key={p.id} className="glass rise flex items-center gap-3 rounded-3xl p-3.5" style={{ animationDelay: `${i * 0.04}s` }}>
                <button onClick={() => dispatch({ type: 'VIEW_PROFILE', id: p.id })} className="pop">
                  <Avatar emoji={p.avatar} size={46} ring={isFriend ? '#2B8CBE' : '#F5A623'} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {p.name} {isFriend && <span className="ml-1 rounded-full bg-sky/15 px-1.5 py-0.5 text-[10px] text-sky">FRIEND</span>}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-ink/50">
                    <span>Rank {p.level}</span>
                    <span className="flex items-center gap-0.5">
                      <Trophy className="h-3 w-3" /> {p.wins}W
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Hexagon className="h-3 w-3" /> {formatNum(p.points)}
                    </span>
                  </p>
                </div>
                <button onClick={() => challenge(p.id)} className="btn-sky pop flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold">
                  <Zap className="h-4 w-4" /> Fight
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
