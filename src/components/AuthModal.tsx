import { useState, type FormEvent } from 'react'
import { Lock, Mail, User as UserIcon, Zap } from 'lucide-react'
import { AVATARS } from '@/data/fixtures'
import { useApp } from '@/lib/store'
import { LogoMark, Wordmark } from './Logo'
import { DevCredit } from './DevCredit'

type Tab = 'login' | 'signup' | 'guest'

const TABS: { id: Tab; label: string }[] = [
  { id: 'login', label: 'Log in' },
  { id: 'signup', label: 'Sign up' },
  { id: 'guest', label: 'Guest' },
]

function handleFrom(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14) || 'player'
}

export function AuthModal() {
  const { dispatch } = useApp()
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [error, setError] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (tab === 'guest') {
      const guestName = name.trim() || `Guest Bee ${Math.floor(1000 + Math.random() * 9000)}`
      dispatch({ type: 'SIGN_IN', user: { name: guestName, handle: handleFrom(guestName), avatar, isGuest: true } })
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (tab === 'signup' && !name.trim()) return setError('Pick a player name.')
    const displayName = tab === 'signup' ? name.trim() : email.split('@')[0]
    dispatch({ type: 'SIGN_IN', user: { name: displayName, handle: handleFrom(displayName), avatar, email, isGuest: false } })
  }

  const inputCls =
    'w-full rounded-2xl border border-white/80 bg-white/70 py-3 pr-4 pl-11 text-[15px] shadow-[inset_0_1px_2px_rgb(29_33_41/0.06)] outline-none transition focus:border-honey focus:ring-4 focus:ring-honey/20'

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4">
      <div className="backdrop-in absolute inset-0 bg-ink/30 backdrop-blur-md" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="glass-strong modal-in relative w-full max-w-md overflow-hidden rounded-[2rem] p-7"
      >
        <div className="honeycomb pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <div className="flex flex-col items-center text-center">
            <LogoMark size={60} />
            <h2 id="auth-title" className="mt-3 font-display text-2xl font-bold">
              Welcome to <Wordmark />
            </h2>
            <p className="mt-1 text-sm text-ink/60">Join the hive to save your levels and climb the leaderboard.</p>
          </div>

          <div className="mt-6 grid grid-cols-3 rounded-2xl bg-ink/5 p-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id)
                  setError('')
                }}
                className={`pop rounded-xl py-2 text-sm font-bold transition ${
                  tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-ink/50 hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            {(tab === 'signup' || tab === 'guest') && (
              <label className="relative block">
                <UserIcon className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-ink/40" />
                <input
                  className={inputCls}
                  placeholder={tab === 'guest' ? 'Nickname (optional)' : 'Player name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={24}
                />
              </label>
            )}
            {tab !== 'guest' && (
              <>
                <label className="relative block">
                  <Mail className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-ink/40" />
                  <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </label>
                <label className="relative block">
                  <Lock className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-ink/40" />
                  <input
                    className={inputCls}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  />
                </label>
              </>
            )}

            {tab !== 'login' && (
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-ink/50 uppercase">Choose your avatar</p>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {AVATARS.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setAvatar(a)}
                      aria-label={`Avatar ${a}`}
                      className={`pop grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl transition ${
                        avatar === a ? 'bg-honey/25 ring-2 ring-honey' : 'bg-white/70 ring-1 ring-ink/5'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'guest' && (
              <p className="rounded-2xl bg-sky/10 px-4 py-3 text-xs leading-relaxed text-sky">
                Guest progress is kept on this device. Create an account any time to sync it.
              </p>
            )}

            {error && <p className="shake text-sm font-semibold text-bad">{error}</p>}

            <button type="submit" className="btn-honey pop mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-lg font-bold">
              <Zap className="h-5 w-5" />
              {tab === 'login' ? 'Enter the Hive' : tab === 'signup' ? 'Create account' : 'Play as Guest'}
            </button>
          </form>

          <DevCredit className="mt-5 block text-center text-xs text-ink/50" />
        </div>
      </div>
    </div>
  )
}
