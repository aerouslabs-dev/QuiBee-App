import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

/** Players synced from the client so admins can see stats and adjust points. */
export const players = pgTable('players', {
  id: text().primaryKey(),
  name: text().notNull(),
  handle: text().notNull(),
  avatar: text().notNull().default('🐝'),
  email: text(),
  isGuest: boolean('is_guest').notNull().default(true),
  points: integer().notNull().default(0),
  wins: integer().notNull().default(0),
  losses: integer().notNull().default(0),
  streak: integer().notNull().default(0),
  stars: integer().notNull().default(0),
  levelsCleared: integer('levels_cleared').notNull().default(0),
  /** Admin point adjustment not yet applied by the player's client. */
  pendingPoints: integer('pending_points').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
})

/** Admin-authored questions. Only verified ones are served to players. */
export const customQuestions = pgTable(
  'custom_questions',
  {
    id: serial().primaryKey(),
    subject: text().notNull(),
    /** null = may appear in any level of the subject */
    level: integer(),
    prompt: text().notNull(),
    options: jsonb().$type<[string, string, string, string]>().notNull(),
    answer: integer().notNull(),
    difficulty: integer().notNull().default(1),
    verified: boolean().notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('custom_questions_subject_idx').on(t.subject, t.level)],
)

/** Admin-created events shown alongside the built-in ones. */
export const customEvents = pgTable('custom_events', {
  id: serial().primaryKey(),
  name: text().notNull(),
  description: text().notNull().default(''),
  rules: jsonb().$type<string[]>().notNull().default([]),
  /** gameplay engine: 'timefast' | 'googly' */
  mode: text().notNull(),
  subject: text().notNull().default('gk'),
  rewardMultiplier: integer('reward_multiplier').notNull().default(2),
  endsAt: timestamp('ends_at').notNull(),
  active: boolean().notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const adminSessions = pgTable('admin_sessions', {
  /** sha256 of the session token; the raw token only lives in the httpOnly cookie */
  tokenHash: text('token_hash').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const adminLoginFailures = pgTable(
  'admin_login_failures',
  {
    id: serial().primaryKey(),
    ip: text().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('admin_login_failures_ip_idx').on(t.ip, t.createdAt)],
)
