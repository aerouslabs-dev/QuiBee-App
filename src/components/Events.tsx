import { Clock, Gift, Play, Timer, Zap } from 'lucide-react'
import { EVENTS, type SubjectId } from '@/data/fixtures'
import { hoursUntil, type EventMode } from '@/lib/content'
import { useApp } from '@/lib/store'

interface EventCard {
  key: string
  name: string
  description: string
  rules: string[]
  mode: EventMode
  rewardMultiplier: number
  endsInHours: number
  eventId?: number
  subjectId: SubjectId
}

export function Events() {
  const { state, startQuiz } = useApp()
  const cards: EventCard[] = [
    ...EVENTS.map((e) => ({ ...e, key: e.id, mode: e.id, subjectId: 'gk' as SubjectId })),
    ...state.content.events.map((e) => ({
      key: `custom-${e.id}`,
      name: e.name,
      description: e.description,
      rules: e.rules,
      mode: e.mode,
      rewardMultiplier: e.rewardMultiplier,
      endsInHours: hoursUntil(e.endsAt),
      eventId: e.id,
      subjectId: (e.subject === 'mixed' ? 'gk' : e.subject) as SubjectId,
    })),
  ]
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Events</h1>
        <p className="text-sm text-ink/55">Limited-time challenges with boosted rewards.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((e, i) => {
          const Icon = e.mode === 'timefast' ? Timer : Zap
          const gradient = e.mode === 'timefast' ? 'from-sky to-[#5B6CE0]' : 'from-honey-light via-honey to-[#F07B1E]'
          const dark = e.mode === 'timefast'
          return (
            <article
              key={e.key}
              className={`rise relative flex flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br ${gradient} p-6 ${dark ? 'text-white' : 'text-ink'} shadow-[0_24px_50px_-24px_rgb(29_33_41/0.6)]`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="honeycomb absolute inset-0 opacity-70 mix-blend-overlay" />
              <div className="relative flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/25 backdrop-blur">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-black/15 px-3 py-1 text-xs font-bold">
                  <Clock className="h-3.5 w-3.5" /> Ends in {e.endsInHours}h
                </span>
              </div>
              <h2 className="relative mt-5 font-display text-3xl font-bold">{e.name}</h2>
              <p className="relative mt-1 text-sm opacity-80">{e.description}</p>
              <ul className="relative mt-4 space-y-1.5 text-sm">
                {e.rules.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
                    {r}
                  </li>
                ))}
              </ul>
              <div className="relative mt-6 flex items-center gap-3 pt-2">
                <span className="flex items-center gap-1.5 rounded-2xl bg-white/25 px-3 py-2 text-sm font-bold backdrop-blur">
                  <Gift className="h-4 w-4" /> ×{e.rewardMultiplier} points
                </span>
                <button
                  onClick={() => startQuiz({ mode: e.mode, subjectId: e.subjectId, level: 1, eventId: e.eventId })}
                  className="pop ml-auto flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 font-display text-lg font-bold text-white shadow-[0_4px_0_#000]"
                >
                  <Play className="h-5 w-5 fill-honey text-honey" /> Play
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <section className="glass rounded-3xl p-5 text-center">
        <p className="font-display text-lg font-bold">More events are buzzing in</p>
        <p className="text-sm text-ink/55">Seasonal tournaments and community-created events land here.</p>
      </section>
    </div>
  )
}
