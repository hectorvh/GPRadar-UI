/** Threshold filtering and box geometry (pure, unit-tested). */
import type { Box, Detection } from './types'

export const THRESHOLD_DEFAULT = 0.25
export const THRESHOLD_MIN = 0.05
export const THRESHOLD_MAX = 1
export const THRESHOLD_STEP = 0.05

/** Slider values come from 0.05 steps in floating point (0.15000000000000002). */
const EPS = 1e-9

export function filterByThreshold<T extends Pick<Detection, 'confidence'>>(detections: T[], threshold: number): T[] {
  return detections.filter((d) => d.confidence >= threshold - EPS)
}

/** Parse a range-input value onto the 0.05 grid within [min, max]. */
export function parseThreshold(raw: string | number): number {
  const n = typeof raw === 'number' ? raw : Number.parseFloat(raw)
  if (!Number.isFinite(n)) return THRESHOLD_DEFAULT
  const snapped = Math.round(n / THRESHOLD_STEP) * THRESHOLD_STEP
  return Number(Math.min(THRESHOLD_MAX, Math.max(THRESHOLD_MIN, snapped)).toFixed(2))
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const pct = (v: number) => `${Number((v * 100).toFixed(4))}%`

export interface BoxPercent {
  left: string
  top: string
  width: string
  height: string
}

/** box_norm (0–1) → CSS percentages for an absolutely positioned overlay. */
export function boxToPercent(box: Box): BoxPercent {
  const x0 = clamp01(Math.min(box.x_min, box.x_max))
  const x1 = clamp01(Math.max(box.x_min, box.x_max))
  const y0 = clamp01(Math.min(box.y_min, box.y_max))
  const y1 = clamp01(Math.max(box.y_min, box.y_max))
  return { left: pct(x0), top: pct(y0), width: pct(x1 - x0), height: pct(y1 - y0) }
}

export function shownLabel(shown: number, total: number): string {
  return `${shown} of ${total} shown`
}
