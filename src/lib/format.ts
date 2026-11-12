/** Number formatting and units. */
import type { Axes } from './types'

export const DASH = '—'

export function fixed(value: number | null | undefined, digits: number): string {
  return value == null || !Number.isFinite(value) ? DASH : value.toFixed(digits)
}

export function conf(value: number): string {
  return value.toFixed(2)
}

export function shortRev(rev: string | null | undefined): string {
  if (!rev) return DASH
  return /^[0-9a-f]{12,}$/i.test(rev) ? rev.slice(0, 7) : rev
}

export function megabytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`
}

/** "12 ms" below a second, "1.4 s" above. */
export function duration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`
}

/** YYYY-MM-DD in local time. */
export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** File-name-safe stem: no extension, only [A-Za-z0-9_-], at most 60 chars. */
export function safeStem(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? ''
  const stem = base.replace(/\.[^.]*$/, '')
  const safe = stem.replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60)
  return safe || 'input'
}

export interface Tick {
  value: number
  label: string
  /** 0–100, position along the axis */
  pct: number
}

/** About `target` evenly spaced ticks on a 1-2-5 step between min and max. */
export function niceTicks(min: number, max: number, target = 6): Tick[] {
  const span = max - min
  if (!(span > 0) || !Number.isFinite(span)) return []
  const raw = span / Math.max(1, target - 1)
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag
  const digits = Math.max(0, -Math.floor(Math.log10(step) + 1e-9) + (step / mag === 2.5 ? 1 : 0))
  const ticks: Tick[] = []
  const first = Math.ceil(min / step - 1e-9) * step
  for (let v = first; v <= max + step * 1e-9; v += step) {
    const value = Number(v.toFixed(10))
    ticks.push({ value, label: value.toFixed(digits), pct: ((value - min) / span) * 100 })
  }
  return ticks
}

export const AXIS_LABEL = {
  m: 'Distance (m)',
  trace: 'Trace',
  ns: 'Two-way time (ns)',
  sample: 'Sample',
} as const

export function axisTitles(axes: Axes) {
  return { x: AXIS_LABEL[axes.x.unit], y: AXIS_LABEL[axes.y.unit] }
}
