/**
 * Server-only admin auth helpers. NEVER import this from client code.
 *
 * Credentials are checked here, on the server. The password is stored only as
 * a salted scrypt hash; set ADMIN_USERNAME / ADMIN_PASSWORD env vars to
 * override the defaults without touching code.
 */
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { and, eq, gt, lt, sql } from 'drizzle-orm'
import { deleteCookie, getCookie, getRequestHeader, getRequestIP, setCookie } from '@tanstack/react-start/server'
import { db } from '../../db/index.js'
import { adminLoginFailures, adminSessions } from '../../db/schema.js'

const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD_HASH = 'scrypt$582ec7de3b2a63db275b7f45f270ef5a$4673fe4ac6e0e969c383c0083e0d6566db01c974473d2b6d3220a0bde10c61ee03ab3d88d0b88cba96a9e2d91bb2129e0acf345b46aedd1ea9832d3b8f6cde10'

export const ADMIN_COOKIE = 'quibee_admin'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const MAX_FAILURES = 5
const FAILURE_WINDOW_MS = 15 * 60 * 1000

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b)
}

function checkPassword(password: string): boolean {
  const envPassword = process.env.ADMIN_PASSWORD
  if (envPassword) return safeEqual(Buffer.from(password), Buffer.from(envPassword))
  const [, salt, hex] = DEFAULT_PASSWORD_HASH.split('$')
  const expected = Buffer.from(hex, 'hex')
  return safeEqual(scryptSync(password, salt, expected.length, { N: 16384, r: 8, p: 1 }), expected)
}

function checkUsername(username: string): boolean {
  const expected = process.env.ADMIN_USERNAME || DEFAULT_USERNAME
  return safeEqual(Buffer.from(username.trim().toLowerCase()), Buffer.from(expected.toLowerCase()))
}

function clientIp(): string {
  return getRequestHeader('x-nf-client-connection-ip') || getRequestIP({ xForwardedFor: true }) || 'unknown'
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export type LoginResult = { ok: true } | { ok: false; error: string }

export async function loginAdmin(username: string, password: string): Promise<LoginResult> {
  const ip = clientIp()
  const since = new Date(Date.now() - FAILURE_WINDOW_MS)
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(adminLoginFailures)
    .where(and(eq(adminLoginFailures.ip, ip), gt(adminLoginFailures.createdAt, since)))
  if (count >= MAX_FAILURES) return { ok: false, error: 'Too many attempts. Try again in 15 minutes.' }

  // Evaluate both so timing doesn't reveal which one was wrong.
  const userOk = checkUsername(username)
  const passOk = checkPassword(password)
  if (!userOk || !passOk) {
    await db.insert(adminLoginFailures).values({ ip })
    return { ok: false, error: 'Invalid admin username or password.' }
  }

  await db.delete(adminLoginFailures).where(eq(adminLoginFailures.ip, ip))
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()))

  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await db.insert(adminSessions).values({ tokenHash: hashToken(token), expiresAt })
  setCookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  })
  return { ok: true }
}

export async function isAdmin(): Promise<boolean> {
  const token = getCookie(ADMIN_COOKIE)
  if (!token) return false
  const [row] = await db
    .select({ expiresAt: adminSessions.expiresAt })
    .from(adminSessions)
    .where(eq(adminSessions.tokenHash, hashToken(token)))
  return !!row && row.expiresAt > new Date()
}

/** Throws unless the request carries a valid admin session. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorized')
}

export async function logoutAdmin(): Promise<void> {
  const token = getCookie(ADMIN_COOKIE)
  if (token) await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)))
  deleteCookie(ADMIN_COOKIE, { path: '/' })
}
