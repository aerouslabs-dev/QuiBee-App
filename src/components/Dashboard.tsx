import type { CSSProperties } from 'react'
import { ChevronRight, Hexagon, Play, Star, Swords, Target, Timer, Trophy, Zap } from 'lucide-react'
import { EVENTS, SUBJECTS, TOTAL_LEVELS, multiplierFor } from '@/data/fixtures'
import { useApp } from '@/lib/store'
import { formatNum } from './Avatar'
import { Ring } from './Ring'
import { SubjectIcon } from './SubjectIcon'

export function Dashboard() {
  const { state, dispatch, navigate, startQuiz, totalStars, levelsCleared, playerLevel } = useApp()
  const current = SUBJECTS.find((s) => s.id === state.selectedSubject) ?? SUBJECTS[0]
  const nextLevel = state.progress[current.id].unlocked
  const firstName = state.user?.name.split(' ')[0] ?? 'Bee'
  const winRate = state.wins + state.losses > 0 ? Math.round((state.wins / (state.wins + state.losses)) * 100) : 0

  const stats = [
    { label: 'Total points', value: formatNum(state.points), Icon: Hexagon, color: 'text-honey-deep bg-honey/15' },
    { label: 'Stars earned', value: formatNum(totalStars), Icon: Star, color: 'text-amber-500 bg-amber-400/15' },
    { label: 'Levels cleared', value: formatNum(levelsCleared), Icon: Target, color: 'text-sky bg-sky/12' },
    { label: 'Battle win rate', value: `${winRate}%`, Icon: Trophy, color: 'text-emerald-600 bg-emerald-500/12' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-honey-light via-honey to-[#F07B1E] p-6 text-ink shadow-[0_24px_50px_-20px_rgb(245_166_35/0.8)] sm:p-8">
        <div className="honeycomb absolute inset-0 opacity-70 mix-blend-overlay" />
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/25 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-ink/70">Rank {playerLevel} · Hive Explorer</p>
            <h1 className="mt-1 font-display text-4xl leading-tight font-bold sm:text-5xl">
              Ready to buzz,
              <br />
              {firstName}?
            </h1>
            <p className="mt-2 max-w-sm text-sm font-medium text-ink/75">
              Continue <b>{current.name}</b> at Level {nextLevel} — ×{multiplierFor(nextLevel)} points multiplier.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => startQuiz({ mode: 'level', subjectId: current.id, level: nextLevel })}
              className="pop flex items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-display text-lg font-bold text-white shadow-[0_4px_0_#000,0_14px_24px_-10px_rgb(0_0_0/0.6)]"
            >
              <Play className="h-5 w-5 fill-honey text-honey" /> Play Levels
            </button>
            <button
              onClick={() => navigate('battle')}
              className="pop flex items-center gap-2 rounded-2xl bg-white/70 px-5 py-3.5 font-display text-lg font-bold backdrop-blur"
            >
              <Swords className="h-5 w-5 text-sky" /> 1v1
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, Icon, color }, i) => (
          <div key={label} className="glass rise rounded-3xl p-4" style={{ animationDelay: `${i * 0.05}s` }}>
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}>
              <Icon className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">{value}</p>
            <p className="text-xs font-semibold text-ink/50">{label}</p>
          </div>
        ))}
      </section>

      {/* Subjects */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Choose a subject</h2>
          <span className="text-xs font-semibold text-ink/50">{TOTAL_LEVELS} levels each</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s, i) => {
            const p = state.progress[s.id]
            const cleared = p.unlocked - 1
            return (
              <button
                key={s.id}
                onClick={() => dispatch({ type: 'SELECT_SUBJECT', subjectId: s.id })}
                className="glass pop rise group flex items-center gap-4 rounded-3xl p-4 text-left"
                style={{ animationDelay: `${0.1 + i * 0.04}s` }}
              >
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_20px_-10px_var(--c)]"
                  style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})`, '--c': s.from } as CSSProperties}
                >
                  <SubjectIcon icon={s.icon} className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg font-bold">{s.name}</span>
                  <span className="block truncate text-xs text-ink/55">{s.tagline}</span>
                  <span className="mt-1 block text-[11px] font-bold text-ink/45">
                    Level {p.unlocked} · {cleared}/{TOTAL_LEVELS} cleared
                  </span>
                </span>
                <Ring value={cleared / TOTAL_LEVELS} size={44} stroke={5} color={s.from}>
                  <ChevronRight className="h-4 w-4 text-ink/40 transition group-hover:translate-x-0.5" />
                </Ring>
              </button>
            )
          })}
        </div>
      </section>

      {/* Live events */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Live events</h2>
          <button onClick={() => navigate('events')} className="text-xs font-bold text-sky">
            See all
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {EVENTS.map((e) => (
            <button
              key={e.id}
              onClick={() => navigate('events')}
              className="glass-dark pop relative overflow-hidden rounded-3xl p-5 text-left"
            >
              <div className="honeycomb absolute inset-0 opacity-40" />
              <div className="relative flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-honey text-ink">
                  {e.id === 'timefast' ? <Timer className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                </span>
                <span className="flex-1">
                  <span className="block font-display text-lg font-bold">{e.name}</span>
                  <span className="block text-xs text-white/60">Ends in {e.endsInHours}h · ×{e.rewardMultiplier} rewards</span>
                </span>
                <ChevronRight className="h-5 w-5 text-white/50" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
