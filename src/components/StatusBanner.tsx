import type { BackendStatus } from '../hooks/useBackend'
import type { RunState } from '../hooks/useRun'

interface Props {
  backend: BackendStatus
  slow: boolean
  onRetryBackend: () => void
  run: Pick<RunState, 'status' | 'retrying' | 'error'>
  warnings: string[]
  /** Client-side problem (e.g. PNG export failed). */
  notice?: string | null
}

/** Wake-up, busy-retry, error and API warning messages above the viewer. */
export function StatusBanner({ backend, slow, onRetryBackend, run, warnings, notice }: Props) {
  const items = []
  if (notice) {
    items.push(
      <p key="notice" className="warn" role="alert" style={{ fontSize: 13 }}>
        {notice}
      </p>,
    )
  }

  if (backend === 'waking' && slow) {
    items.push(
      <div key="wake" className="note banner" role="status">
        <span className="spin" aria-hidden="true" style={{ color: 'var(--accent)' }} />
        <p>
          Starting the detector server (free hosting, up to about a minute)…
          {run.status === 'queued' && ' Your run will start when it is ready'}
        </p>
      </div>,
    )
  }
  if (backend === 'down') {
    items.push(
      <div key="down" className="warn note banner" role="alert">
        <p>The detector server did not respond. It may be down or still starting</p>
        <button type="button" className="btn sm" onClick={onRetryBackend}>
          Retry
        </button>
      </div>,
    )
  }
  if (run.retrying) {
    items.push(
      <div key="busy" className="note banner" role="status">
        <span className="spin" aria-hidden="true" style={{ color: 'var(--accent)' }} />
        <p>Server busy, retrying…</p>
      </div>,
    )
  }
  if (run.status === 'error' && run.error) {
    items.push(
      <p key="err" className="warn" role="alert" style={{ fontSize: 13 }}>
        {run.error.message}
      </p>,
    )
  }
  if (warnings.length > 0) {
    items.push(
      <div key="warnings" className="note" role="status">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>,
    )
  }

  if (items.length === 0) return null
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{items}</div>
}
