/**
 * Admin-published content (verified questions + custom events) shared by the
 * client and server. Kept free of server-only imports.
 */
import { SUBJECTS, seeded, type Question, type SubjectId } from '@/data/fixtures'

export type EventMode = 'timefast' | 'googly'

export interface PublishedQuestion extends Question {
  subject: SubjectId
  /** null = may appear in any level of the subject */
  level: number | null
}

export interface PublishedEvent {
  id: number
  name: string
  description: string
  rules: string[]
  mode: EventMode
  /** 'mixed' or a subject id */
  subject: SubjectId | 'mixed'
  rewardMultiplier: number
  endsAt: string
}

export const SUBJECT_IDS = SUBJECTS.map((s) => s.id)
export const EVENT_MODES: EventMode[] = ['timefast', 'googly']

/** How many subject-wide custom questions can rotate into a single level. */
const MAX_POOL_PER_LEVEL = 3

/**
 * Merge verified custom questions into a level's fixture set: level-pinned
 * ones first, then a deterministic handful from the subject-wide pool.
 */
export function mergeLevelQuestions(
  base: Question[],
  custom: PublishedQuestion[],
  subjectId: SubjectId,
  level: number,
): Question[] {
  const pinned = custom.filter((q) => q.subject === subjectId && q.level === level)
  const pool = custom.filter((q) => q.subject === subjectId && q.level === null)
  const rand = seeded(level * 104729 + subjectId.charCodeAt(0))
  const rotated = [...pool].sort(() => rand() - 0.5).slice(0, MAX_POOL_PER_LEVEL)
  const extra = [...pinned, ...rotated].slice(0, base.length)
  if (!extra.length) return base
  return [...extra, ...base.slice(0, base.length - extra.length)]
}

export function hoursUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 3_600_000))
}
