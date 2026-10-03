import { createServerFn } from '@tanstack/react-start'
import { asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { customEvents, customQuestions, players } from '../../db/schema.js'
import { EVENT_MODES, SUBJECT_IDS } from '@/lib/content'
import { isAdmin, loginAdmin, logoutAdmin, requireAdmin } from './admin.server'

const text = (v: unknown, field: string, max: number) => {
  const s = String(v ?? '').trim()
  if (!s) throw new Error(`${field} is required`)
  return s.slice(0, max)
}
const intIn = (v: unknown, field: string, min: number, max: number) => {
  const n = Math.floor(Number(v))
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${field} must be between ${min} and ${max}`)
  return n
}
const optionalId = (v: unknown) => (v == null ? undefined : intIn(v, 'id', 1, 2 ** 31 - 1))

// ── Auth ────────────────────────────────────────────────────────────────────

export const adminLogin = createServerFn({ method: 'POST' })
  .inputValidator((d: { username: string; password: string }) => ({
    username: String(d?.username ?? '').slice(0, 64),
    password: String(d?.password ?? '').slice(0, 256),
  }))
  .handler(async ({ data }) => loginAdmin(data.username, data.password))

export const adminLogout = createServerFn({ method: 'POST' }).handler(async () => {
  await logoutAdmin()
  return { ok: true }
})

export const getAdminStatus = createServerFn({ method: 'GET' }).handler(async () => ({ isAdmin: await isAdmin() }))

// ── Overview ────────────────────────────────────────────────────────────────

export const getAdminOverview = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const [playerRows, questionRows, eventRows, [totals]] = await Promise.all([
    db.select().from(players).orderBy(desc(players.points)).limit(200),
    db.select().from(customQuestions).orderBy(desc(customQuestions.createdAt)),
    db.select().from(customEvents).orderBy(asc(customEvents.endsAt)),
    db
      .select({
        players: sql<number>`count(*)::int`,
        guests: sql<number>`count(*) filter (where ${players.isGuest})::int`,
        activeToday: sql<number>`count(*) filter (where ${players.lastSeenAt} > now() - interval '1 day')::int`,
        totalPoints: sql<number>`coalesce(sum(${players.points}), 0)::int`,
        totalWins: sql<number>`coalesce(sum(${players.wins}), 0)::int`,
      })
      .from(players),
  ])
  return {
    totals,
    players: playerRows.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), lastSeenAt: p.lastSeenAt.toISOString() })),
    questions: questionRows.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() })),
    events: eventRows.map((e) => ({ ...e, endsAt: e.endsAt.toISOString(), createdAt: e.createdAt.toISOString() })),
  }
})

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>

// ── Questions ───────────────────────────────────────────────────────────────

export interface QuestionInput {
  id?: number
  subject: string
  level: number | null
  prompt: string
  options: string[]
  answer: number
  difficulty: number
  verified: boolean
}

export const saveQuestion = createServerFn({ method: 'POST' })
  .inputValidator((d: QuestionInput) => {
    if (!SUBJECT_IDS.includes(d?.subject as never)) throw new Error('Unknown subject')
    if (!Array.isArray(d.options) || d.options.length !== 4) throw new Error('Provide exactly 4 options')
    const options = d.options.map((o, i) => text(o, `Option ${'ABCD'[i]}`, 200)) as [string, string, string, string]
    if (new Set(options.map((o) => o.toLowerCase())).size !== 4) throw new Error('Options must be different')
    return {
      id: optionalId(d.id),
      subject: d.subject,
      level: d.level == null ? null : intIn(d.level, 'Level', 1, 100),
      prompt: text(d.prompt, 'Question', 400),
      options,
      answer: intIn(d.answer, 'Correct answer', 0, 3),
      difficulty: intIn(d.difficulty, 'Difficulty', 1, 3),
      verified: !!d.verified,
    }
  })
  .handler(async ({ data }) => {
    await requireAdmin()
    const { id, ...values } = data
    if (id) await db.update(customQuestions).set(values).where(eq(customQuestions.id, id))
    else await db.insert(customQuestions).values(values)
    return { ok: true }
  })

export const setQuestionVerified = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: number; verified: boolean }) => ({ id: intIn(d?.id, 'id', 1, 2 ** 31 - 1), verified: !!d.verified }))
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.update(customQuestions).set({ verified: data.verified }).where(eq(customQuestions.id, data.id))
    return { ok: true }
  })

export const deleteQuestion = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: number }) => ({ id: intIn(d?.id, 'id', 1, 2 ** 31 - 1) }))
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.delete(customQuestions).where(eq(customQuestions.id, data.id))
    return { ok: true }
  })

// ── Events ──────────────────────────────────────────────────────────────────

export interface EventInput {
  id?: number
  name: string
  description: string
  rules: string[]
  mode: string
  subject: string
  rewardMultiplier: number
  endsAt: string
  active: boolean
}

export const saveEvent = createServerFn({ method: 'POST' })
  .inputValidator((d: EventInput) => {
    if (!EVENT_MODES.includes(d?.mode as never)) throw new Error('Unknown event mode')
    if (d.subject !== 'mixed' && !SUBJECT_IDS.includes(d.subject as never)) throw new Error('Unknown subject')
    const endsAt = new Date(d.endsAt)
    if (Number.isNaN(endsAt.getTime())) throw new Error('Pick an end date')
    return {
      id: optionalId(d.id),
      name: text(d.name, 'Event name', 80),
      description: String(d.description ?? '').trim().slice(0, 400),
      rules: (Array.isArray(d.rules) ? d.rules : []).map((r) => String(r).trim().slice(0, 160)).filter(Boolean).slice(0, 8),
      mode: d.mode,
      subject: d.subject,
      rewardMultiplier: intIn(d.rewardMultiplier, 'Reward multiplier', 1, 10),
      endsAt,
      active: !!d.active,
    }
  })
  .handler(async ({ data }) => {
    await requireAdmin()
    const { id, ...values } = data
    if (id) await db.update(customEvents).set(values).where(eq(customEvents.id, id))
    else await db.insert(customEvents).values(values)
    return { ok: true }
  })

export const deleteEvent = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: number }) => ({ id: intIn(d?.id, 'id', 1, 2 ** 31 - 1) }))
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.delete(customEvents).where(eq(customEvents.id, data.id))
    return { ok: true }
  })

// ── Players ─────────────────────────────────────────────────────────────────

/** Add (or subtract) points. The player's device picks up the change on its next sync. */
export const adjustPlayerPoints = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: string; delta: number }) => ({
    id: text(d?.id, 'Player id', 64),
    delta: intIn(d?.delta, 'Points', -1_000_000, 1_000_000),
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    if (data.delta === 0) return { ok: true }
    await db
      .update(players)
      .set({
        points: sql`greatest(0, ${players.points} + ${data.delta})`,
        pendingPoints: sql`${players.pendingPoints} + ${data.delta}`,
      })
      .where(eq(players.id, data.id))
    return { ok: true }
  })
