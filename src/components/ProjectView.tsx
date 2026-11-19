import type { QueueItem } from '../hooks/useBatch'
import { shortDate, shownCount, type Analysis, type Project } from '../lib/library'
import { AnalysisIcon, DotsIcon, DownloadIcon, PlayIcon, PlusIcon, TrashIcon } from './icons'

interface Props {
  project: Project
  analyses: Analysis[]
  queue: QueueItem[]
  /** The queue is running a B-scan of this project. */
  running: boolean
  paused: boolean
  zipping: boolean
  onNewAnalysis: () => void
  onPause: () => void
  onResume: () => void
  onRetryFailed: () => void
  onRemoveQueued: (key: string) => void
  onOpen: (id: string) => void
  onMenu: (id: string, anchor: HTMLElement) => void
  menuOpenId: string | null
  onCsv: (a: Analysis) => void
  onPng: (a: Analysis) => void
  onZip: () => void
}

const STATUS: Record<QueueItem['status'], string> = {
  pending: 'Queued',
  running: 'Running…',
  waiting: 'Waiting (server limit), retrying…',
  error: 'Failed',
}

/** One project: its B-scans, a queue to run them one after another, and downloads. */
export function ProjectView(p: Props) {
  const failed = p.queue.filter((q) => q.status === 'error').length
  /** Still to run or in progress: pending, running and waiting (not failed). */
  const queued = p.queue.length - failed
  const waiting = p.queue.filter((q) => q.status === 'pending').length
  const total = p.analyses.reduce((n, a) => n + shownCount(a), 0)
  const empty = p.analyses.length === 0 && p.queue.length === 0

  return (
    <section aria-labelledby="project-title" className="project-view">
      <div className="project-head">
        <div style={{ minWidth: 0 }}>
          <p className="sec-title">Project</p>
          <h2 id="project-title" style={{ fontSize: 20, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.project.name}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {p.analyses.length} B-scan{p.analyses.length === 1 ? '' : 's'} analysed · {total} detection{total === 1 ? '' : 's'} shown
            {queued > 0 && ` · ${queued} queued`}
            {failed > 0 && ` · ${failed} failed`}
          </p>
        </div>
        <div className="project-actions">
          <button type="button" className="btn primary" onClick={p.onNewAnalysis}>
            <PlusIcon />
            New analysis
          </button>
          {p.running && (
            <button type="button" className="btn" onClick={p.onPause}>
              <span className="spin" aria-hidden="true" />
              Pause
            </button>
          )}
          {p.paused && waiting > 0 && (
            <button type="button" className="btn" onClick={p.onResume}>
              <PlayIcon />
              Resume ({waiting})
            </button>
          )}
          {failed > 0 && !p.running && (
            <button type="button" className="btn" onClick={p.onRetryFailed}>
              Retry failed ({failed})
            </button>
          )}
          <button type="button" className="btn" disabled={p.analyses.length === 0 || p.zipping} aria-busy={p.zipping} onClick={p.onZip}>
            {p.zipping ? <span className="spin" aria-hidden="true" /> : <DownloadIcon />}
            Download project (.zip)
          </button>
        </div>
      </div>

      {empty ? (
        <div className="drop" style={{ padding: 32, cursor: 'default' }}>
          <AnalysisIcon size={22} />
          <span style={{ fontWeight: 500, color: 'var(--text)' }}>No analyses in this project yet</span>
          <span style={{ fontSize: 12 }}>Use New analysis to run one or more B-scans with the same setup</span>
          <button type="button" className="btn primary" style={{ marginTop: 6 }} onClick={p.onNewAnalysis}>
            <PlusIcon />
            New analysis
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', position: 'relative' }}>
          <table className="det project-table">
            <thead>
              <tr>
                <th scope="col">B-scan</th>
                <th scope="col">Mode</th>
                <th scope="col">Detections</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {p.analyses.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button type="button" className="scan-link" onClick={() => p.onOpen(a.id)} title="Open this analysis">
                      <AnalysisIcon />
                      <span>{a.name}</span>
                    </button>
                  </td>
                  <td>{a.mode === 'full' ? 'Full pipeline' : 'Detector only'}</td>
                  <td className="mono">
                    {shownCount(a)} <span style={{ color: 'var(--muted)' }}>≥ {a.threshold.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="chip ok">Done · {shortDate(a.updatedAt)}</span>
                  </td>
                  <td>
                    <span className="row-actions">
                      <button type="button" className="btn sm" onClick={() => p.onCsv(a)} aria-label={`Download CSV for ${a.name}`}>
                        <DownloadIcon /> CSV
                      </button>
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => p.onPng(a)}
                        aria-label={`Download annotated PNG for ${a.name}`}
                      >
                        <DownloadIcon /> PNG
                      </button>
                      <button
                        type="button"
                        className="btn sm ghost icon"
                        aria-label={`Options for ${a.name}`}
                        aria-haspopup="menu"
                        aria-expanded={p.menuOpenId === a.id}
                        onClick={(e) => p.onMenu(a.id, e.currentTarget)}
                      >
                        <DotsIcon />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
              {p.queue.map((q) => (
                <tr key={q.key} className="queued">
                  <td>
                    <span className="scan-link static">
                      <AnalysisIcon />
                      <span>{q.label}</span>
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{q.mode === 'full' ? 'Full pipeline' : 'Detector only'}</td>
                  <td style={{ color: 'var(--muted)' }}>–</td>
                  <td>
                    <span className={'chip' + (q.status === 'error' ? ' err' : '')} title={q.error}>
                      {(q.status === 'running' || q.status === 'waiting') && <span className="spin" aria-hidden="true" />}
                      {q.status === 'pending' && p.paused ? 'Paused' : STATUS[q.status]}
                    </span>
                    {q.error && (
                      <div style={{ fontSize: 11, color: 'var(--warn-ink)', whiteSpace: 'normal', maxWidth: 260 }}>{q.error}</div>
                    )}
                  </td>
                  <td>
                    <span className="row-actions">
                      <button
                        type="button"
                        className="btn sm ghost icon"
                        aria-label={`Remove ${q.label} from the queue`}
                        disabled={q.status === 'running' || q.status === 'waiting'}
                        onClick={() => p.onRemoveQueued(q.key)}
                      >
                        <TrashIcon />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
        Queued B-scans run one after another and are kept in memory only: they are lost if you reload before they finish.
      </p>
    </section>
  )
}
