import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { SUBJECTS, TOTAL_LEVELS, type SubjectId } from '@/data/fixtures'
import type { PublishedEvent, PublishedQuestion } from '@/lib/content'
import { getPublishedContent, syncPlayer } from '@/server/content.functions'

export type ActiveView =
  | 'dashboard'
  | 'subject_select'
  | 'quiz'
  | 'battle'
  | 'events'
  | 'leaderboard'
  | 'profile'
  | 'admin'

export type QuizMode = 'level' | 'timefast' | 'googly' | 'battle'

export interface QuizSession {
  mode: QuizMode
  subjectId: SubjectId
  level: number
  /** opponent player id when mode === 'battle' */
  opponentId?: string
  /** admin-created event id when launched from a custom event */
  eventId?: number
  /** unique per launch so the quiz screen fully remounts */
  key: number
}

export interface User {
  /** stable id used to sync stats to the server */
  id: string
  name: string
  handle: string
  avatar: string
  email?: string
  isGuest: boolean
}

export interface SubjectProgress {
  /** highest unlocked level (1-based) */
  unlocked: number
  stars: Record<number, number>
  best: Record<number, number>
}

export interface LevelResult {
  subjectId: SubjectId
  level: number
  score: number
  stars: number
}

interface State {
  activeView: ActiveView
  session: QuizSession | null
  selectedSubject: SubjectId
  profileId: string | 'me'
  user: User | null
  points: number
  wins: number
  losses: number
  streak: number
  following: string[]
  progress: Record<SubjectId, SubjectProgress>
  content: { questions: PublishedQuestion[]; events: PublishedEvent[] }
  hydrated: boolean
}

type Action =
  | { type: 'NAVIGATE'; view: ActiveView }
  | { type: 'SELECT_SUBJECT'; subjectId: SubjectId }
  | { type: 'START_QUIZ'; session: Omit<QuizSession, 'key'> }
  | { type: 'VIEW_PROFILE'; id: string | 'me' }
  | { type: 'SIGN_IN'; user: Omit<User, 'id'> }
  | { type: 'SIGN_OUT' }
  | { type: 'AWARD'; points: number }
  | { type: 'COMPLETE_LEVEL'; result: LevelResult }
  | { type: 'BATTLE_RESULT'; won: boolean; points: number }
  | { type: 'TOGGLE_FOLLOW'; id: string }
  | { type: 'ADMIN_ADJUST'; points: number }
  | { type: 'SET_CONTENT'; content: State['content'] }
  | { type: 'HYDRATE'; saved: Partial<State> }

const STORAGE_KEY = 'quibee:v1'

function emptyProgress(): Record<SubjectId, SubjectProgress> {
  return Object.fromEntries(SUBJECTS.map((s) => [s.id, { unlocked: 1, stars: {}, best: {} }])) as Record<
    SubjectId,
    SubjectProgress
  >
}

const initialState: State = {
  activeView: 'dashboard',
  session: null,
  selectedSubject: 'math',
  profileId: 'me',
  user: null,
  points: 0,
  wins: 0,
  losses: 0,
  streak: 0,
  following: [],
  progress: emptyProgress(),
  content: { questions: [], events: [] },
  hydrated: false,
}

function newPlayerId() {
  return crypto.randomUUID()
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, activeView: action.view, profileId: action.view === 'profile' ? 'me' : state.profileId }
    case 'SELECT_SUBJECT':
      return { ...state, selectedSubject: action.subjectId, activeView: 'subject_select' }
    case 'START_QUIZ':
      return {
        ...state,
        session: { ...action.session, key: Date.now() },
        selectedSubject: action.session.subjectId,
        activeView: 'quiz',
      }
    case 'VIEW_PROFILE':
      return { ...state, profileId: action.id, activeView: 'profile' }
    case 'SIGN_IN':
      return { ...state, user: { ...action.user, id: newPlayerId() } }
    case 'SIGN_OUT':
      return { ...initialState, content: state.content, hydrated: true }
    case 'AWARD':
      return { ...state, points: state.points + action.points }
    case 'COMPLETE_LEVEL': {
      const { subjectId, level, score, stars } = action.result
      const prev = state.progress[subjectId]
      const passed = stars > 0
      return {
        ...state,
        streak: passed ? state.streak + 1 : 0,
        progress: {
          ...state.progress,
          [subjectId]: {
            unlocked: passed ? Math.min(TOTAL_LEVELS, Math.max(prev.unlocked, level + 1)) : prev.unlocked,
            stars: { ...prev.stars, [level]: Math.max(prev.stars[level] ?? 0, stars) },
            best: { ...prev.best, [level]: Math.max(prev.best[level] ?? 0, score) },
          },
        },
      }
    }
    case 'BATTLE_RESULT':
      return {
        ...state,
        wins: state.wins + (action.won ? 1 : 0),
        losses: state.losses + (action.won ? 0 : 1),
        points: state.points + action.points,
      }
    case 'TOGGLE_FOLLOW':
      return {
        ...state,
        following: state.following.includes(action.id)
          ? state.following.filter((f) => f !== action.id)
          : [...state.following, action.id],
      }
    case 'ADMIN_ADJUST':
      return { ...state, points: Math.max(0, state.points + action.points) }
    case 'SET_CONTENT':
      return { ...state, content: action.content }
    case 'HYDRATE': {
      const user = action.saved.user ? { ...action.saved.user, id: action.saved.user.id || newPlayerId() } : null
      return { ...state, ...action.saved, user, progress: { ...state.progress, ...action.saved.progress }, hydrated: true }
    }
  }
}

function useAppState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Preview persistence: saved in this browser only, until accounts move server-side.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      dispatch({ type: 'HYDRATE', saved: raw ? (JSON.parse(raw) as Partial<State>) : {} })
    } catch {
      dispatch({ type: 'HYDRATE', saved: {} })
    }
  }, [])

  useEffect(() => {
    if (!state.hydrated) return
    const { user, points, wins, losses, streak, following, progress } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, points, wins, losses, streak, following, progress }))
  }, [state])

  // Admin-published questions and events.
  useEffect(() => {
    getPublishedContent()
      .then((content) => dispatch({ type: 'SET_CONTENT', content }))
      .catch(() => {})
  }, [])

  const navigate = useCallback((view: ActiveView) => dispatch({ type: 'NAVIGATE', view }), [])
  const startQuiz = useCallback((session: Omit<QuizSession, 'key'>) => dispatch({ type: 'START_QUIZ', session }), [])

  const totalStars = useMemo(
    () =>
      Object.values(state.progress).reduce(
        (sum, p) => sum + Object.values(p.stars).reduce((a, b) => a + b, 0),
        0,
      ),
    [state.progress],
  )
  const levelsCleared = useMemo(
    () => Object.values(state.progress).reduce((sum, p) => sum + (p.unlocked - 1), 0),
    [state.progress],
  )
  // Sync stats so admins can see them, and pick up any admin point adjustments.
  const { user, points, wins, losses, streak, hydrated } = state
  useEffect(() => {
    if (!hydrated || !user) return
    const t = window.setTimeout(() => {
      syncPlayer({
        data: { ...user, points, wins, losses, streak, stars: totalStars, levelsCleared },
      })
        .then(({ pendingPoints }) => {
          if (pendingPoints) dispatch({ type: 'ADMIN_ADJUST', points: pendingPoints })
        })
        .catch(() => {})
    }, 1500)
    return () => window.clearTimeout(t)
  }, [hydrated, user, points, wins, losses, streak, totalStars, levelsCleared])

  /** Player rank derived from points: 1 rank per 1,500 pts */
  const playerLevel = Math.max(1, Math.floor(state.points / 1500) + 1)

  return { state, dispatch, navigate, startQuiz, totalStars, levelsCleared, playerLevel }
}

type AppContextValue = ReturnType<typeof useAppState>

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppState()
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
