import type { InputKind, Mode, RunResponse } from './types'

/**
 * The user's library, kept in this browser (IndexedDB) until accounts exist.
 * - An Analysis is one B-scan run: its input, mode, threshold and result.
 * - A Project is a named collection of analyses.
 * An analysis belongs to at most one project (projectId) or is independent (null).
 */
export interface Analysis {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  pinned: boolean
  archived: boolean
  /** Project it belongs to, or null for an independent analysis. */
  projectId: string | null
  source: { kind: InputKind; label: string; sampleId: string | null }
  mode: Mode
  threshold: number
  result: RunResponse
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  pinned: boolean
  archived: boolean
}

/** Most analyses kept in the browser; the oldest unpinned independent ones go first. */
export const MAX_ANALYSES = 200

interface Sortable {
  pinned: boolean
  updatedAt: number
}

/** Pinned first, then most recently changed. */
export function sortItems<T extends Sortable>(list: T[]): T[] {
  return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
}

export function splitArchived<T extends Sortable & { archived: boolean }>(list: T[]): { active: T[]; archived: T[] } {
  const sorted = sortItems(list)
  return { active: sorted.filter((p) => !p.archived), archived: sorted.filter((p) => p.archived) }
}

/** Analyses of one project, in the order they were added. */
export function analysesOf(list: Analysis[], projectId: string): Analysis[] {
  return list.filter((a) => a.projectId === projectId).sort((a, b) => a.createdAt - b.createdAt)
}

/** Analyses that belong to no project (or to a project that no longer exists). */
export function independentAnalyses(list: Analysis[], projects: Project[]): Analysis[] {
  const ids = new Set(projects.map((p) => p.id))
  return list.filter((a) => !a.projectId || !ids.has(a.projectId))
}

/**
 * Ids to delete so that at most `max` analyses remain: never pinned ones and
 * never analyses inside a project; archived before active, oldest first.
 */
export function analysesToPrune(list: Analysis[], max = MAX_ANALYSES): string[] {
  const extra = list.length - max
  if (extra <= 0) return []
  return list
    .filter((a) => !a.pinned && !a.projectId)
    .sort((a, b) => Number(b.archived) - Number(a.archived) || a.updatedAt - b.updatedAt)
    .slice(0, extra)
    .map((a) => a.id)
}

/** Number of detections at or above the analysis's own threshold. */
export function shownCount(a: Analysis): number {
  return a.result.detections.filter((d) => d.confidence >= a.threshold).length
}

export function newId(prefix = ''): string {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return prefix + id
}

/** "17 Nov" this year, "17 Nov 2025" for another year. */
export function shortDate(ts: number, now = Date.now()): string {
  const d = new Date(ts)
  const sameYear = d.getFullYear() === new Date(now).getFullYear()
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) })
}

/** A name not used yet among `taken`: "Project 1", "Project 2", … */
export function nextName(base: string, taken: string[]): string {
  const set = new Set(taken)
  for (let i = 1; ; i++) if (!set.has(`${base} ${i}`)) return `${base} ${i}`
}

/** File names inside a zip: safe characters, unique within the archive. */
export function uniqueStems(names: string[]): string[] {
  const seen = new Map<string, number>()
  return names.map((n) => {
    const stem =
      n
        .replace(/\.[a-z0-9]{1,5}$/i, '')
        .replace(/[^A-Za-z0-9._-]+/g, '_')
        .replace(/\.{2,}/g, '_')
        .replace(/^[._]+|[._]+$/g, '')
        .replace(/_{2,}/g, '_')
        .slice(0, 60) || 'analysis'
    const k = stem.toLowerCase()
    const c = seen.get(k) ?? 0
    seen.set(k, c + 1)
    return c === 0 ? stem : `${stem}_${c + 1}`
  })
}
