import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, gt, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { customEvents, customQuestions, players } from '../../db/schema.js'
import type { PublishedEvent, PublishedQuestion } from '@/lib/content'

/** Verified questions + live custom events, served to every player. */
export const getPublishedContent = createServerFn({ method: 'GET' }).handler(async () => {
  const [qs, evs] = await Promise.all([
    db.select().from(customQuestions).where(eq(customQuestions.verified, true)).orderBy(asc(customQuestions.id)),
    db
      .select()
      .from(customEvents)
      .where(and(eq(customEvents.active, true), gt(customEvents.endsAt, new Date())))
      .orderBy(asc(customEvents.endsAt)),
  ])
  const questions: PublishedQuestion[] = qs.map((q) => ({
    id: `custom-${q.id}`,
    subject: q.subject as PublishedQuestion['subject'],
    level: q.level,
    prompt: q.prompt,
    options: q.options,
    answer: q.answer,
    difficulty: q.difficulty as PublishedQuestion['difficulty'],
  }))
  const events: PublishedEvent[] = evs.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    rules: e.rules,
    mode: e.mode as PublishedEvent['mode'],
    subject: e.subject as PublishedEvent['subject'],
    rewardMultiplier: e.rewardMultiplier,
    endsAt: e.endsAt.toISOString(),
  }))
  return { questions, events }
})

export interface PlayerSync {
  id: string
  name: string
  handle: string
  avatar: string
  email?: string
  isGuest: boolean
  points: number
  wins: number
  losses: number
  streak: number
  stars: number
  levelsCleared: number
}

const int = (v: unknown) => Math.max(0, Math.floor(Number(v) || 0))
const str = (v: unknown, max: number) => String(v ?? '').slice(0, max)

/**
 * Upsert the player's stats so admins can see them. Returns any admin point
 * adjustment the client still needs to apply.
 */
export const syncPlayer = createServerFn({ method: 'POST' })
  .inputValidator((d: PlayerSync): PlayerSync => {
    if (!d || typeof d.id !== 'string' || !/^[a-zA-Z0-9-]{8,64}$/.test(d.id)) throw new Error('Invalid player id')
    return {
      id: d.id,
      name: str(d.name, 40) || 'Player',
      handle: str(d.handle, 24) || 'player',
      avatar: str(d.avatar, 8) || '🐝',
      email: d.email ? str(d.email, 120) : undefined,
      isGuest: !!d.isGuest,
      points: int(d.points),
      wins: int(d.wins),
      losses: int(d.losses),
      streak: int(d.streak),
      stars: int(d.stars),
      levelsCleared: int(d.levelsCleared),
    }
  })
  .handler(async ({ data }) => {
    const { id, ...stats } = data
    const [existing] = await db.select({ pending: players.pendingPoints }).from(players).where(eq(players.id, id))
    const pending = existing?.pending ?? 0
    const values = { ...stats, email: stats.email ?? null, lastSeenAt: new Date() }
    await db
      .insert(players)
      .values({ id, ...values })
      .onConflictDoUpdate({
        target: players.id,
        set: {
          ...values,
          // The client applies `pending` right after this call; keep the stored total consistent.
          points: sql`greatest(0, ${stats.points} + ${pending})`,
          pendingPoints: sql`${players.pendingPoints} - ${pending}`,
        },
      })
    return { pendingPoints: pending }
  })
