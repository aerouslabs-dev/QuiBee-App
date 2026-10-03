import type { CSSProperties } from 'react'
import { ArrowLeft, Lock, Play, Star } from 'lucide-react'
import { TOTAL_LEVELS, getSubject, multiplierFor } from '@/data/fixtures'
import { useApp } from '@/lib/store'
import { SubjectIcon } from './SubjectIcon'

const TIERS = [
  { from: 1, to: 25, name: 'Larva', note: 'Warm-up' },
  { from: 26, to: 50, name: 'Worker', note: 'Getting tricky' },
  { from: 51, to: 75, name: 'Drone', note: 'Expert' },
  { from: 76, to: 100, name: 'Royal', note: 'Legendary' },
]

export function SubjectSelect() {
  const { state, navigate, startQuiz } = useApp()
  const subject = getSubject(state.selectedSubject)
  const progress = state.progress[subject.id]
  const play = (level: number) => startQuiz({ mode: 'level', subjectId: subject.id, level })

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('dashboard')} className="pop flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All subjects
      </button>

      <section
        className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_24px_50px_-24px_var(--c)] sm:p-8"
        style={{ background: `linear-gradient(135deg, ${subject.from}, ${subject.to})`, '--c': subject.from } as CSSProperties}
      >
        <div className="honeycomb absolute inset-0 opacity-60 mix-blend-overlay" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white/20 backdrop-blur">
            <SubjectIcon icon={subject.icon} className="h-10 w-10" />
          </span>
          <div className="flex-1">
            <h1 className="font-display text-4xl font-bold">{subject.name}</h1>
            <p className="text-sm text-white/80">{subject.tagline}</p>
            <p className="mt-2 text-xs font-bold text-white/80">
              {progress.unlocked - 1} of {TOTAL_LEVELS} levels cleared
            </p>
          </div>
          <button onClick={() => play(progress.unlocked)} className="btn-honey pop flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-display text-lg font-bold">
            <Play className="h-5 w-5 fill-ink" /> Play Level {progress.unlocked}
          </button>
        </div>
      </section>

      {TIERS.map((tier) => (
        <section key={tier.name} className="glass rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold">
              {tier.name} <span className="text-sm font-semibold text-ink/40">· Levels {tier.from}–{tier.to}</span>
            </h2>
            <span className="text-xs font-bold text-ink/50">
              {tier.note} · up to ×{multiplierFor(tier.to)}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: tier.to - tier.from + 1 }, (_, i) => tier.from + i).map((level) => {
              const locked = level > progress.unlocked
              const stars = progress.stars[level] ?? 0
              const isNext = level === progress.unlocked
              return (
                <button
                  key={level}
                  disabled={locked}
                  onClick={() => play(level)}
                  aria-label={locked ? `Level ${level} locked` : `Play level ${level}`}
                  className={`pop relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-bold transition ${
                    locked
                      ? 'cursor-not-allowed bg-ink/5 text-ink/25'
                      : isNext
                        ? 'btn-honey'
                        : 'bg-white/80 text-ink shadow-sm ring-1 ring-ink/5'
                  }`}
                  style={isNext ? undefined : !locked ? { color: subject.from } : undefined}
                >
                  {locked ? <Lock className="h-3.5 w-3.5" /> : <span className="font-display text-base">{level}</span>}
                  {!locked && !isNext && (
                    <span className="mt-0.5 flex gap-px">
                      {[1, 2, 3].map((n) => (
                        <Star key={n} className={`h-2.5 w-2.5 ${n <= stars ? 'fill-honey text-honey' : 'text-ink/15'}`} />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
