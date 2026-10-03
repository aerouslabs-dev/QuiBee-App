import { useEffect, useState } from 'react'
import { useApp, type ActiveView } from '@/lib/store'
import { AuthModal } from './AuthModal'
import { Battle } from './Battle'
import { BottomNav } from './BottomNav'
import { Dashboard } from './Dashboard'
import { Events } from './Events'
import { Footer } from './Footer'
import { Leaderboard } from './Leaderboard'
import { Navbar } from './Navbar'
import { Profile } from './Profile'
import { QuizScreen } from './QuizScreen'
import { SplashScreen } from './SplashScreen'
import { SubjectSelect } from './SubjectSelect'

const SPLASH_MS = 2500
const SPLASH_FADE_MS = 500

type BootPhase = 'splash' | 'leaving' | 'ready'

function useBoot(): BootPhase {
  const [phase, setPhase] = useState<BootPhase>('splash')
  useEffect(() => {
    const a = window.setTimeout(() => setPhase('leaving'), SPLASH_MS)
    const b = window.setTimeout(() => setPhase('ready'), SPLASH_MS + SPLASH_FADE_MS)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [])
  return phase
}

function ActiveScreen({ view }: { view: ActiveView }) {
  const { state } = useApp()
  switch (view) {
    case 'quiz':
      return state.session ? <QuizScreen key={state.session.key} session={state.session} /> : <SubjectSelect />
    case 'subject_select':
      return <SubjectSelect />
    case 'battle':
      return <Battle />
    case 'events':
      return <Events />
    case 'leaderboard':
      return <Leaderboard />
    case 'profile':
      return <Profile />
    case 'admin':
    case 'dashboard':
    default:
      return <Dashboard />
  }
}

export function AppShell() {
  const { state } = useApp()
  const phase = useBoot()
  const inQuiz = state.activeView === 'quiz'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [state.activeView, state.profileId, state.session?.key])

  const showAuth = phase !== 'splash' && state.hydrated && !state.user

  return (
    <>
      {phase !== 'ready' && <SplashScreen leaving={phase === 'leaving'} />}

      <div className="honeycomb pointer-events-none fixed inset-0 -z-10 opacity-60" />
      <Navbar />
      <main className={`mx-auto max-w-5xl px-4 pt-6 sm:px-6 ${inQuiz ? 'pb-10' : ''}`}>
        <div key={`${state.activeView}-${state.profileId}-${state.session?.key ?? ''}`} className="view-in">
          <ActiveScreen view={state.activeView} />
        </div>
      </main>
      {!inQuiz && <Footer />}
      {!inQuiz && <BottomNav />}

      {showAuth && <AuthModal />}
    </>
  )
}
