import type { ReactNode } from 'react'
import { ArrowLeft, Hexagon, Star, Swords, Trophy, UserCheck, UserPlus, Users } from 'lucide-react'
import { PLAYERS, SUBJECTS, TOTAL_LEVELS, getPlayer, getSubject } from '@/data/fixtures'
import { useApp } from '@/lib/store'
import { Avatar, formatNum } from './Avatar'
import { Ring } from './Ring'
import { SubjectIcon } from './SubjectIcon'

interface CardData {
  name: string
  handle: string
  avatar: string
  level: number
  points: number
  wins: number
  losses: number
  title: string
  country: string
  followers: number
  favorite: string
}

/** FreeFire-style gamer card. */
function GamerCard({ data, action }: { data: CardData; action?: ReactNode }) {
  const ratio = data.losses === 0 ? data.wins.toFixed(1) : (data.wins / data.losses).toFixed(2)
  const stats = [
    { label: 'Total points', value: formatNum(data.points), Icon: Hexagon },
    { label: 'W/L ratio', value: ratio, Icon: Trophy },
    { label: 'Battles', value: formatNum(data.wins + data.losses), Icon: Swords },
    { label: 'Followers', value: formatNum(data.followers), Icon: Users },
  ]
  return (
    <section className="view-in relative overflow-hidden rounded-[2rem] bg-[#141821] text-white shadow-[0_30px_60px_-24px_rgb(29_33_41/0.7)]">
      <div className="absolute inset-0 bg-[radial-gradient(40rem_20rem_at_0%_0%,rgb(245_166_35/0.55),transparent_60%),radial-gradient(30rem_20rem_at_100%_100%,rgb(43_140_190/0.55),transparent_60%)]" />
      <div className="honeycomb absolute inset-0 opacity-60" />
      <div className="absolute top-0 right-0 h-full w-1/2 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgb(255_255_255/0.035)_18px_36px)]" />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="relative">
            <Avatar emoji={data.avatar} size={96} ring="#F5A623" />
            <span className="absolute -bottom-3 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center">
              <svg viewBox="0 0 40 40" className="absolute inset-0">
                <path d="M20 1 37 10.5v19L20 39 3 29.5v-19z" fill="#2B8CBE" stroke="#fff" strokeWidth="2" />
              </svg>
              <span className="relative font-display text-sm font-bold">{data.level}</span>
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-[11px] font-bold tracking-[0.2em] text-honey uppercase">{data.title}</p>
            <h1 className="truncate font-display text-3xl font-bold">{data.name}</h1>
            <p className="text-sm text-white/55">
              @{data.handle} · {data.country}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              <Star className="h-3 w-3 fill-honey text-honey" /> Favourite: {data.favorite}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <Icon className="h-4 w-4 text-honey" />
              <p className="mt-2 font-display text-xl font-bold">{value}</p>
              <p className="text-[10px] font-bold tracking-wider text-white/45 uppercase">{label}</p>
            </div>
          ))}
        </div>

        {action && <div className="mt-6">{action}</div>}
      </div>
    </section>
  )
}

export function Profile() {
  const { state, dispatch, navigate, startQuiz, playerLevel, totalStars } = useApp()
  const other = state.profileId !== 'me' ? getPlayer(state.profileId) : undefined

  if (other) {
    const following = state.following.includes(other.id)
    return (
      <div className="space-y-5">
        <button onClick={() => navigate('leaderboard')} className="pop flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Leaderboard
        </button>
        <GamerCard
          data={{ ...other, followers: other.followers + (following ? 1 : 0), favorite: getSubject(other.favoriteSubject).name }}
          action={
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_FOLLOW', id: other.id })}
                className={`pop flex items-center justify-center gap-2 rounded-2xl py-3 font-display text-lg font-bold ${following ? 'bg-white/15 text-white' : 'btn-honey'}`}
              >
                {following ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                {following ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={() => startQuiz({ mode: 'battle', subjectId: 'gk', level: 1, opponentId: other.id })}
                className="btn-sky pop flex items-center justify-center gap-2 rounded-2xl py-3 font-display text-lg font-bold"
              >
                <Swords className="h-5 w-5" /> Challenge
              </button>
            </div>
          }
        />
      </div>
    )
  }

  const user = state.user
  const fav = SUBJECTS.reduce((best, s) => (state.progress[s.id].unlocked > state.progress[best.id].unlocked ? s : best), SUBJECTS[0])
  const followingPlayers = PLAYERS.filter((p) => state.following.includes(p.id))

  return (
    <div className="space-y-5">
      <GamerCard
        data={{
          name: user?.name ?? 'Guest Bee',
          handle: user?.handle ?? 'guest',
          avatar: user?.avatar ?? '🐝',
          level: playerLevel,
          points: state.points,
          wins: state.wins,
          losses: state.losses,
          title: user?.isGuest ? 'Guest Explorer' : 'Hive Explorer',
          country: `${totalStars} ★`,
          followers: 0,
          favorite: fav.name,
        }}
      />

      <section className="glass rounded-3xl p-5">
        <h2 className="font-display text-xl font-bold">Subject mastery</h2>
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
          {SUBJECTS.map((s) => {
            const cleared = state.progress[s.id].unlocked - 1
            return (
              <button key={s.id} onClick={() => dispatch({ type: 'SELECT_SUBJECT', subjectId: s.id })} className="pop flex flex-col items-center gap-1.5">
                <Ring value={cleared / TOTAL_LEVELS} size={58} stroke={5} color={s.from}>
                  <SubjectIcon icon={s.icon} className="h-5 w-5" style={{ color: s.from }} />
                </Ring>
                <span className="text-center text-[10px] leading-tight font-bold text-ink/60">{s.name}</span>
                <span className="text-[10px] font-bold text-ink/40">{cleared}/{TOTAL_LEVELS}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="font-display text-xl font-bold">Following · {followingPlayers.length}</h2>
        {followingPlayers.length === 0 ? (
          <p className="mt-2 text-sm text-ink/55">
            Find rivals on the{' '}
            <button onClick={() => navigate('leaderboard')} className="font-bold text-sky">
              leaderboard
            </button>{' '}
            and follow them to track their progress.
          </p>
        ) : (
          <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-1">
            {followingPlayers.map((p) => (
              <button key={p.id} onClick={() => dispatch({ type: 'VIEW_PROFILE', id: p.id })} className="pop flex w-16 shrink-0 flex-col items-center gap-1">
                <Avatar emoji={p.avatar} size={52} />
                <span className="w-full truncate text-center text-xs font-bold">{p.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
