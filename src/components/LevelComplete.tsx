import { ArrowRight, House, RotateCcw, Star, Trophy } from 'lucide-react'
import { TOTAL_LEVELS, getSubject, type Player } from '@/data/fixtures'
import { useApp, type QuizSession } from '@/lib/store'
import { Avatar } from './Avatar'
import { Confetti } from './Confetti'
import { Ring } from './Ring'

export interface QuizOutcome {
  score: number
  correct: number
  total: number
  accuracy: number
  stars: number
  seconds: number
  opponentScore?: number
}

interface Props {
  session: QuizSession
  outcome: QuizOutcome
  opponent?: Player
  onNextLevel: () => void
  onRetry: () => void
  onDashboard: () => void
}

export function LevelComplete({ session, outcome, opponent, onNextLevel, onRetry, onDashboard }: Props) {
  const { state } = useApp()
  const isBattle = session.mode === 'battle'
  const won = isBattle && outcome.score > (outcome.opponentScore ?? 0)
  const tied = isBattle && outcome.score === outcome.opponentScore
  const passed = isBattle ? won : session.mode === 'level' ? outcome.stars > 0 : outcome.correct > 0
  const canAdvance = session.mode === 'level' && outcome.stars > 0 && session.level < TOTAL_LEVELS

  const heading = isBattle
    ? won
      ? 'Victory!'
      : tied
        ? 'It’s a draw!'
        : 'Defeat'
    : session.mode === 'level'
      ? passed
        ? `Level ${session.level} complete!`
        : 'So close!'
      : 'Event complete!'

  const sub = isBattle
    ? `vs ${opponent?.name ?? 'Opponent'}`
    : session.mode === 'level'
      ? `${getSubject(session.subjectId).name}${passed ? '' : ' · reach 50% accuracy to earn a star'}`
      : `${outcome.correct} correct in ${outcome.seconds}s`

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      {passed && <Confetti />}
      <div className="backdrop-in absolute inset-0 bg-ink/40 backdrop-blur-md" />
      <div role="dialog" aria-modal="true" aria-labelledby="result-title" className="glass-strong modal-in relative w-full max-w-sm overflow-hidden rounded-[2rem] p-6 text-center">
        <div className="honeycomb pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          {isBattle ? (
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <Avatar emoji={state.user?.avatar ?? '🐝'} size={56} ring={won ? '#F5A623' : '#cbd5e1'} />
                <span className="font-display text-2xl font-bold">{outcome.score}</span>
              </div>
              <Trophy className={`h-10 w-10 ${won ? 'star-in fill-honey text-honey' : 'text-ink/20'}`} />
              <div className="flex flex-col items-center gap-1">
                <Avatar emoji={opponent?.avatar ?? '🤖'} size={56} ring={!won && !tied ? '#2B8CBE' : '#cbd5e1'} />
                <span className="font-display text-2xl font-bold">{outcome.opponentScore}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`star-in ${n === 2 ? '-mt-3 h-14 w-14' : 'h-11 w-11'} ${n <= outcome.stars ? 'fill-honey text-honey drop-shadow-[0_6px_10px_rgb(245_166_35/0.6)]' : 'fill-ink/8 text-ink/15'}`}
                  style={{ animationDelay: `${0.25 + n * 0.18}s` }}
                />
              ))}
            </div>
          )}

          <h2 id="result-title" className="mt-4 font-display text-3xl font-bold">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-ink/55">{sub}</p>

          <div className="mt-6 grid grid-cols-3 items-center gap-2">
            <div>
              <p className="font-display text-3xl font-bold text-honey-deep">{outcome.score}</p>
              <p className="text-[11px] font-bold text-ink/45 uppercase">Score</p>
            </div>
            <div className="flex justify-center">
              <Ring value={outcome.accuracy / 100} size={78} stroke={8} color={outcome.accuracy >= 50 ? '#22C55E' : '#EF4444'}>
                <span className="font-display text-lg font-bold">{outcome.accuracy}%</span>
              </Ring>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-sky">
                {outcome.correct}/{outcome.total}
              </p>
              <p className="text-[11px] font-bold text-ink/45 uppercase">Correct</p>
            </div>
          </div>
          <p className="mt-1 text-[11px] font-bold text-ink/40 uppercase">Accuracy</p>

          <div className="mt-6 grid gap-2">
            {canAdvance ? (
              <button onClick={onNextLevel} className="btn-honey pop flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-lg font-bold">
                Next Level <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button onClick={onRetry} className="btn-honey pop flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-lg font-bold">
                <RotateCcw className="h-5 w-5" /> {isBattle ? 'Rematch' : 'Play again'}
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              {canAdvance && (
                <button onClick={onRetry} className="pop flex items-center justify-center gap-1.5 rounded-2xl bg-white/80 py-3 text-sm font-bold ring-1 ring-ink/5">
                  <RotateCcw className="h-4 w-4" /> Replay
                </button>
              )}
              <button
                onClick={onDashboard}
                className={`pop flex items-center justify-center gap-1.5 rounded-2xl bg-white/80 py-3 text-sm font-bold ring-1 ring-ink/5 ${canAdvance ? '' : 'col-span-2'}`}
              >
                <House className="h-4 w-4" /> Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
