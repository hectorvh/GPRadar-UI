/** Detections → CSV, made in the browser (no export endpoint). */
import { filterByThreshold } from './detections'
import { isoDate, safeStem } from './format'
import type { Detection, Mode } from './types'

export const CSV_COLUMNS = [
  'id',
  'confidence',
  'x_min',
  'y_min',
  'x_max',
  'y_max',
  'apex_trace',
  'apex_sample',
  'apex_distance_m',
  'apex_twt_ns',
  'apex_depth_m',
] as const

export interface CsvContext {
  mode: Mode
  revision: string
  threshold: number
  velocity: number | null
  date: Date
}

/** Quote a field when needed; neutralise leading formula characters in text. */
export function csvField(value: string | number | null | undefined): string {
  if (value == null) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  let text = value
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Comment lines are not quoted CSV, so keep them on one line. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ')

export function detectionsToCsv(detections: Detection[], ctx: CsvContext): string {
  const shown = filterByThreshold(detections, ctx.threshold)
  const lines = [
    `# GPRadar detections`,
    `# mode: ${oneLine(ctx.mode)}`,
    `# model_revision: ${oneLine(ctx.revision)}`,
    `# confidence_threshold: ${ctx.threshold.toFixed(2)}`,
    `# velocity_m_ns: ${ctx.velocity ?? ''}`,
    `# date: ${ctx.date.toISOString()}`,
    `# box coordinates in processed-image pixels; depth assumes a constant velocity and is approximate`,
    CSV_COLUMNS.join(','),
  ]
  for (const d of shown) {
    const row = [
      d.id,
      d.confidence,
      d.box_px.x_min,
      d.box_px.y_min,
      d.box_px.x_max,
      d.box_px.y_max,
      d.apex.trace,
      d.apex.sample,
      d.apex.distance_m,
      d.apex.twt_ns,
      d.apex.depth_m,
    ]
    lines.push(row.map(csvField).join(','))
  }
  return lines.join('\r\n') + '\r\n'
}

/** gpradar_<input>_<date>.<ext> */
export function exportFilename(input: string, date: Date, ext: 'csv' | 'png'): string {
  return `gpradar_${safeStem(input)}_${isoDate(date)}.${ext}`
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
