import { conf } from '../lib/format'

/** Confidence as a small bar plus the value (table and cards). */
export function ConfBar({ value }: { value: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--border)', display: 'inline-block', overflow: 'hidden' }}>
        <span style={{ display: 'block', height: 6, width: `${Math.round(value * 100)}%`, background: 'var(--accent)' }} />
      </span>
      <span className="mono" data-field="conf">
        {conf(value)}
      </span>
    </span>
  )
}

const msg = { margin: 0, padding: 16, color: 'var(--muted)', fontSize: 13 } as const

/** No result yet, nothing detected, or everything below the threshold. */
export function DetectionsMessage({ total, shown, threshold }: { total: number | null; shown: number; threshold: number }) {
  if (total == null) return <p style={msg}>Run a sample or upload a B-scan to see detections</p>
  if (total === 0) return <p style={msg}>No hyperbolas detected in this scan (confidence ≥ 0.05)</p>
  if (shown === 0)
    return <p style={msg}>No detections above {threshold.toFixed(2)} confidence. Lower the threshold to see more</p>
  return null
}
