import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, Clock, Divide, SkipForward, Users, X } from 'lucide-react'
import {
  EVENTS,
  QUESTION_TIME_SEC,
  getLevelQuestions,
  getMixedQuestions,
  getSubjectQuestions,
  getPlayer,
  getSubject,
  multiplierFor,
  seeded,
  type Question,
} from '@/data/fixtures'
import { mergeLevelQuestions, type PublishedEvent, type PublishedQuestion } from '@/lib/content'
import { useApp, type QuizSession } from '@/lib/store'
import { Avatar } from './Avatar'
import { LevelComplete, type QuizOutcome } from './LevelComplete'
import { Ring } from './Ring'

type Lifeline = 'fifty' | 'poll' | 'time' | 'skip'
type Verdict = 'correct' | 'wrong' | 'timeout' | 'skipped'

const LETTERS = ['A', 'B', 'C', 'D']
const TICK_MS = 100

interface ModeConfig {
  title: string
  badge: string
  questions: Question[]
  /** seconds per question; null when a single global clock is used */
  perQuestion: number | null
  globalSec: number | null
  multiplier: number
  lifelines: boolean
}

function eventQuestions(custom: PublishedEvent | undefined, count: number, seed: number) {
  return custom && custom.subject !== 'mixed' ? getSubjectQuestions(custom.subject, count, seed) : getMixedQuestions(count, seed)
}

function buildMode(session: QuizSession, content: { questions: PublishedQuestion[]; events: PublishedEvent[] }): ModeConfig {
  const subject = getSubject(session.subjectId)
  const custom = session.eventId ? content.events.find((e) => e.id === session.eventId) : undefined
  switch (session.mode) {
    case 'timefast': {
      const ev = EVENTS.find((e) => e.id === 'timefast')!
      return { title: custom?.name ?? ev.name, badge: 'Event', questions: eventQuestions(custom, 40, session.key), perQuestion: null, globalSec: ev.durationSec, multiplier: custom?.rewardMultiplier ?? ev.rewardMultiplier, lifelines: false }
    }
    case 'googly': {
      const ev = EVENTS.find((e) => e.id === 'googly')!
      return { title: custom?.name ?? ev.name, badge: 'Event', questions: eventQuestions(custom, 10, session.key), perQuestion: ev.durationSec, globalSec: null, multiplier: custom?.rewardMultiplier ?? ev.rewardMultiplier, lifelines: true }
    }
    case 'battle':
      return { title: '1v1 Battle', badge: 'Head-to-head', questions: getMixedQuestions(7, session.key), perQuestion: QUESTION_TIME_SEC, globalSec: null, multiplier: 1.5, lifelines: false }
    default:
      return {
        title: subject.name,
        badge: `Level ${session.level}`,
        questions: mergeLevelQuestions(getLevelQuestions(session.subjectId, session.level), content.questions, session.subjectId, session.level),
        perQuestion: QUESTION_TIME_SEC,
        globalSec: null,
        multiplier: multiplierFor(session.level),
        lifelines: true,
      }
  }
}

/** Fake but plausible audience vote, weighted toward the right answer. */
function audiencePoll(q: Question, hidden: number[]): number[] {
  const rand = seeded(q.id.length * 31 + q.prompt.length)
  const confidence = q.difficulty === 1 ? 0.65 : q.difficulty === 2 ? 0.5 : 0.38
  const raw = q.options.map((_, i) => (hidden.includes(i) ? 0 : i === q.answer ? confidence + rand() * 0.2 : rand() * 0.3))
  const total = raw.reduce((a, b) => a + b, 0)
  const pct = raw.map((v) => Math.round((v / total) * 100))
  pct[q.answer] += 100 - pct.reduce((a, b) => a + b, 0)
  return pct
}

function timerColor(fraction: number) {
  return fraction > 0.5 ? '#22C55E' : fraction > 0.25 ? '#F5A623' : '#EF4444'
}

export function QuizScreen({ session }: { session: QuizSession }) {
  const { state: app, dispatch, navigate } = useApp()
  // Snapshot content at mount so a background refresh can't reshuffle a running quiz.
  const [content] = useState(app.content)
  const mode = useMemo(() => buildMode(session, content), [session, content])
  const opponent = session.opponentId ? getPlayer(session.opponentId) : undefined
  const { questions } = mode

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [timeLeft, setTimeLeft] = useState((mode.perQuestion ?? 0) * 1000)
  const [questionTotal, setQuestionTotal] = useState((mode.perQuestion ?? 0) * 1000)
  const [globalLeft, setGlobalLeft] = useState((mode.globalSec ?? 0) * 1000)
  const [score, setScore] = useState(0)
  const [verdicts, setVerdicts] = useState<Verdict[]>([])
  const [used, setUsed] = useState<Set<Lifeline>>(new Set())
  const [hidden, setHidden] = useState<number[]>([])
  const [poll, setPoll] = useState<number[] | null>(null)
  const [pop, setPop] = useState<{ id: number; value: number } | null>(null)
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null)
  const [oppScore, setOppScore] = useState(0)
  const [oppAnswered, setOppAnswered] = useState(false)

  // One-lock guard: a ref so even two clicks inside the same frame can't both register.
  const lockRef = useRef(false)
  const finishedRef = useRef(false)
  const startedAt = useRef(Date.now())
  const q = questions[index]
  const locked = verdict !== null

  // Simulated opponent: decide how fast / how accurately they answer this question.
  const oppPlan = useMemo(() => {
    if (!opponent) return null
    const rand = seeded(session.key + index * 977)
    const skill = 0.45 + (opponent.level / 100) * 0.4
    return { correct: rand() < skill, atMs: 2500 + rand() * 9000 }
  }, [opponent, session.key, index])

  const finish = useCallback(
    (finalScore: number, finalVerdicts: Verdict[], finalOpp: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const correct = finalVerdicts.filter((v) => v === 'correct').length
      const attempted = finalVerdicts.filter((v) => v !== 'skipped').length
      const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0
      const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0
      if (session.mode === 'level') {
        dispatch({ type: 'COMPLETE_LEVEL', result: { subjectId: session.subjectId, level: session.level, score: finalScore, stars } })
      }
      if (session.mode === 'battle') {
        dispatch({ type: 'BATTLE_RESULT', won: finalScore > finalOpp, points: finalScore > finalOpp ? finalScore : Math.round(finalScore / 4) })
      }
      setOutcome({
        score: finalScore,
        correct,
        total: session.mode === 'timefast' ? attempted : questions.length,
        accuracy,
        stars,
        opponentScore: opponent ? finalOpp : undefined,
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
      })
    },
    [dispatch, opponent, questions.length, session],
  )

  const lockAnswer = useCallback(
    (choice: number | null, as?: Verdict) => {
      if (lockRef.current || outcome) return
      lockRef.current = true
      const v: Verdict = as ?? (choice === null ? 'timeout' : choice === q.answer ? 'correct' : 'wrong')
      setSelected(choice)
      setVerdict(v)
      const nextVerdicts = [...verdicts, v]
      setVerdicts(nextVerdicts)

      let nextScore = score
      if (v === 'correct') {
        const speedBonus = mode.perQuestion ? Math.ceil(timeLeft / 1000) : 5
        const earned = Math.round((10 + speedBonus) * mode.multiplier)
        nextScore += earned
        setScore(nextScore)
        setPop({ id: Date.now(), value: earned })
        if (session.mode !== 'battle') dispatch({ type: 'AWARD', points: earned })
      }

      let nextOpp = oppScore
      if (oppPlan?.correct) {
        nextOpp += Math.round((10 + Math.ceil(((mode.perQuestion ?? 0) * 1000 - oppPlan.atMs) / 1000)) * mode.multiplier)
        setOppScore(nextOpp)
        setOppAnswered(true)
      }

      // Time Fast keeps the global clock running, so it flows straight to the next question.
      if (session.mode === 'timefast') {
        window.setTimeout(() => advance(nextScore, nextVerdicts, nextOpp), 650)
      }
    },
    [outcome, q, verdicts, score, mode, timeLeft, session.mode, dispatch, oppScore, oppPlan],
  )

  function advance(curScore = score, curVerdicts = verdicts, curOpp = oppScore) {
    if (finishedRef.current) return
    if (index + 1 >= questions.length) return finish(curScore, curVerdicts, curOpp)
    setIndex((i) => i + 1)
    setSelected(null)
    setVerdict(null)
    setHidden([])
    setPoll(null)
    setOppAnswered(false)
    const t = (mode.perQuestion ?? 0) * 1000
    setTimeLeft(t)
    setQuestionTotal(t)
    lockRef.current = false
  }

  // Per-question countdown — frozen the instant an answer locks.
  useEffect(() => {
    if (!mode.perQuestion || locked || outcome) return
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - TICK_MS)), TICK_MS)
    return () => window.clearInterval(id)
  }, [mode.perQuestion, locked, outcome, index])

  useEffect(() => {
    if (mode.perQuestion && timeLeft <= 0 && !locked && !outcome) lockAnswer(null)
  }, [timeLeft, locked, outcome, mode.perQuestion, lockAnswer])

  // Opponent "answered" indicator during battles.
  useEffect(() => {
    if (!oppPlan || locked) return
    const elapsed = questionTotal - timeLeft
    if (elapsed >= oppPlan.atMs) setOppAnswered(true)
  }, [oppPlan, locked, questionTotal, timeLeft])

  // Global clock for Time Fast.
  useEffect(() => {
    if (!mode.globalSec || outcome) return
    const id = window.setInterval(() => setGlobalLeft((t) => Math.max(0, t - TICK_MS)), TICK_MS)
    return () => window.clearInterval(id)
  }, [mode.globalSec, outcome])

  useEffect(() => {
    if (mode.globalSec && globalLeft <= 0 && !outcome) {
      lockRef.current = true
      finish(score, verdicts, oppScore)
    }
  }, [globalLeft, mode.globalSec, outcome, finish, score, verdicts, oppScore])

  function applyLifeline(l: Lifeline) {
    if (locked || used.has(l) || !mode.lifelines) return
    setUsed(new Set(used).add(l))
    if (l === 'fifty') {
      const wrong = [0, 1, 2, 3].filter((i) => i !== q.answer)
      const rand = seeded(q.prompt.length + index)
      setHidden(wrong.sort(() => rand() - 0.5).slice(0, 2))
    } else if (l === 'poll') {
      setPoll(audiencePoll(q, hidden))
    } else if (l === 'time') {
      setTimeLeft((t) => t + 15_000)
      setQuestionTotal((t) => t + 15_000)
    } else if (l === 'skip') {
      lockAnswer(null, 'skipped')
    }
  }

  const fraction = mode.perQuestion ? timeLeft / questionTotal : globalLeft / ((mode.globalSec ?? 1) * 1000)
  const seconds = Math.ceil((mode.perQuestion ? timeLeft : globalLeft) / 1000)

  const restart = (overrides: Partial<QuizSession> = {}) => dispatch({ type: 'START_QUIZ', session: { ...session, ...overrides } })

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <header className="glass flex items-center gap-3 rounded-3xl p-3 pl-4">
        <button onClick={() => navigate(session.mode === 'level' ? 'subject_select' : session.mode === 'battle' ? 'battle' : 'events')} className="pop grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink/60 hover:text-ink" aria-label="Quit quiz">
          <X className="h-4.5 w-4.5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-tight font-bold">{mode.title}</p>
          <p className="flex items-center gap-2 text-xs font-bold text-ink/50">
            <span className="rounded-full bg-sky/12 px-2 py-0.5 text-sky">{mode.badge}</span>
            {session.mode === 'timefast' ? `${verdicts.length} answered` : `Question ${index + 1}/${questions.length}`}
            <span className="text-honey-deep">· ×{mode.multiplier}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Score</p>
          <p className="font-display text-xl leading-none font-bold">{score}</p>
        </div>
        <Ring value={fraction} size={58} stroke={6} color={timerColor(fraction)} motion="linear">
          <span className={`font-display text-lg font-bold ${fraction <= 0.25 && !locked ? 'text-bad' : ''}`}>{seconds}</span>
        </Ring>
      </header>

      {/* Progress segments */}
      {session.mode !== 'timefast' && (
        <div className="flex gap-1.5 px-1">
          {questions.map((_, i) => {
            const v = verdicts[i]
            return (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  v === 'correct' ? 'bg-ok' : v === 'wrong' || v === 'timeout' ? 'bg-bad' : v === 'skipped' ? 'bg-ink/30' : i === index ? 'bg-honey' : 'bg-ink/10'
                }`}
              />
            )
          })}
        </div>
      )}

      {/* Battle scoreboard */}
      {opponent && (
        <div className="glass-dark flex items-center gap-3 rounded-3xl px-4 py-3">
          <span className="font-display text-2xl font-bold text-honey">{score}</span>
          <span className="flex-1 text-xs font-bold text-white/60">You</span>
          <span className="text-xs font-black text-white/40">VS</span>
          <span className="flex flex-1 items-center justify-end gap-2 text-xs font-bold text-white/60">
            {oppAnswered && !locked && <span className="rounded-full bg-sky px-2 py-0.5 text-[10px] text-white">Answered!</span>}
            {opponent.name.split(' ')[0]}
          </span>
          <Avatar emoji={opponent.avatar} size={30} ring="#2B8CBE" />
          <span className="font-display text-2xl font-bold text-sky-light">{oppScore}</span>
        </div>
      )}

      {/* Question card */}
      <section key={q.id} className="glass-strong view-in relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="honeycomb pointer-events-none absolute inset-0 opacity-50" />
        {pop && verdict === 'correct' && (
          <span key={pop.id} className="points-up absolute top-5 right-6 font-display text-2xl font-bold text-ok">
            +{pop.value}
          </span>
        )}
        <p className="relative text-xs font-bold tracking-wider text-ink/40 uppercase">
          {['Easy', 'Medium', 'Hard'][q.difficulty - 1]} question
        </p>
        <h2 className="relative mt-2 font-display text-2xl leading-snug font-bold sm:text-3xl">{q.prompt}</h2>

        <div className="relative mt-6 grid gap-3" role="group" aria-label="Answer options">
          {q.options.map((opt, i) => {
            const isHidden = hidden.includes(i)
            const isSelected = selected === i
            const isAnswer = i === q.answer
            let state = 'bg-white/80 ring-1 ring-ink/8 hover:ring-honey hover:bg-white'
            if (locked) {
              if (isAnswer) state = `bg-ok text-white ring-2 ring-ok ${isSelected ? 'celebrate' : ''}`
              else if (isSelected) state = 'bg-bad text-white ring-2 ring-bad shake'
              else state = 'bg-white/50 text-ink/40 ring-1 ring-ink/5'
            }
            return (
              <button
                key={i}
                disabled={locked || isHidden}
                onClick={() => lockAnswer(i)}
                aria-pressed={isSelected}
                className={`pop relative flex items-center gap-3 overflow-hidden rounded-2xl p-3.5 text-left text-[15px] font-semibold transition-all duration-300 ${state} ${
                  isHidden ? 'pointer-events-none scale-95 opacity-0' : ''
                } ${locked ? 'cursor-default' : ''}`}
              >
                {poll && !isHidden && (
                  <span className="absolute inset-y-0 left-0 bg-sky/12 transition-all duration-700" style={{ width: `${poll[i]}%` }} />
                )}
                <span
                  className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-xl font-display text-sm font-bold ${
                    locked && (isAnswer || isSelected) ? 'bg-white/25' : 'bg-honey/15 text-honey-deep'
                  }`}
                >
                  {locked && isAnswer ? <Check className="h-4.5 w-4.5" /> : locked && isSelected ? <X className="h-4.5 w-4.5" /> : LETTERS[i]}
                </span>
                <span className="relative flex-1">{opt}</span>
                {poll && !isHidden && <span className="relative text-xs font-bold text-sky">{poll[i]}%</span>}
              </button>
            )
          })}
        </div>

        {locked && session.mode !== 'timefast' && (
          <div className="rise relative mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className={`font-display text-lg font-bold ${verdict === 'correct' ? 'text-ok' : verdict === 'skipped' ? 'text-ink/50' : 'text-bad'}`}>
              {verdict === 'correct' ? 'Buzzing! Correct answer.' : verdict === 'wrong' ? 'Not quite — 0 points.' : verdict === 'timeout' ? 'Time’s up — 0 points.' : 'Question skipped.'}
            </p>
            <button onClick={() => advance()} className="btn-honey pop flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 font-display text-lg font-bold sm:w-auto">
              {index + 1 >= questions.length ? 'See results' : 'Next Question'} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>

      {/* Lifelines */}
      {mode.lifelines && (
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              { id: 'fifty', label: '50/50', Icon: Divide },
              { id: 'poll', label: 'Audience', Icon: Users },
              { id: 'time', label: '+15s', Icon: Clock },
              { id: 'skip', label: 'Skip', Icon: SkipForward },
            ] as const
          ).map(({ id, label, Icon }) => {
            const spent = used.has(id)
            return (
              <button
                key={id}
                onClick={() => applyLifeline(id)}
                disabled={spent || locked}
                className={`glass pop flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-bold transition ${
                  spent ? 'opacity-35 grayscale' : locked ? 'opacity-60' : 'text-sky'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            )
          })}
        </div>
      )}

      {outcome && (
        <LevelComplete
          session={session}
          outcome={outcome}
          opponent={opponent}
          onNextLevel={() => restart({ level: session.level + 1 })}
          onRetry={() => restart()}
          onDashboard={() => navigate('dashboard')}
        />
      )}
    </div>
  )
}
