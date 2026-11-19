import type { RunState } from '../hooks/useRun'
import { duration, shortRev } from '../lib/format'
import type { MetaStrings } from '../lib/metadata'
import { sourceKind, type Source } from '../lib/source'
import type { InputKind, MetaField, Mode } from '../lib/types'
import { MetadataForm } from './MetadataForm'
import { ModeToggle } from './ModeToggle'

interface Props {
  width: number
  /** The chosen input (step 1 lives in the main column); used for mode warnings and Run info. */
  source: Source | null
  mode: Mode
  onMode: (m: Mode) => void
  /** Modes switched on in Settings. */
  modes: Record<Mode, boolean>
  metaOpen: boolean
  onToggleMeta: () => void
  meta: MetaStrings
  onMeta: (f: MetaField, v: string) => void
  metaErrors: Partial<Record<MetaField, string>>
  run: RunState
  onRun: () => void
  canRun: boolean
  modelRevision: string | null
  /** Set in a project's New analysis: several B-scans, one setup for all. */
  batch?: {
    count: number
    /** Kind shared by every selected B-scan, or null when they are mixed. */
    kind: InputKind | null
    canRun: boolean
    onRun: () => void
  } | null
}

function runLabel(run: RunState) {
  switch (run.status) {
    case 'queued':
      return 'Waiting for server…'
    case 'uploading':
      return run.progress != null && run.progress < 1 ? `Uploading… ${Math.round(run.progress * 100)}%` : 'Uploading…'
    case 'running':
      return 'Running…'
    default:
      return 'Run detection'
  }
}

const row = { display: 'flex', justifyContent: 'space-between', gap: 8 } as const

export function InputPanel(p: Props) {
  const busy = p.run.status === 'queued' || p.run.status === 'uploading' || p.run.status === 'running'
  const kind = sourceKind(p.source)
  const result = p.run.result

  return (
    <aside
      className="panel scroll inputpanel"
      aria-label="Processing and metadata"
      style={{
        width: p.width,
        flex: '0 0 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: '18px 16px',
        background: 'var(--side)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p className="sec-title">2 · Processing</p>
        <ModeToggle mode={p.mode} onMode={p.onMode} kind={p.batch ? p.batch.kind : kind} modes={p.modes} />
        {p.batch && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
            Applies to every selected B-scan{p.batch.kind === null && p.batch.count > 1 ? ' (they mix images and raw records)' : ''}
          </p>
        )}
      </div>

      <MetadataForm
        open={p.metaOpen}
        onToggle={p.onToggleMeta}
        values={p.meta}
        onChange={p.onMeta}
        errors={p.metaErrors}
        resolved={result?.metadata ?? null}
      />

      {p.batch ? (
        <button
          type="button"
          className="btn primary"
          style={{ minHeight: 44, fontSize: 15 }}
          disabled={!p.batch.canRun}
          onClick={p.batch.onRun}
        >
          Run {p.batch.count || ''} B-scan{p.batch.count === 1 ? '' : 's'}
        </button>
      ) : (
        <button
          type="button"
          className="btn primary"
          style={{ minHeight: 44, fontSize: 15 }}
          onClick={p.onRun}
          disabled={!p.canRun || busy}
          aria-busy={busy}
          title={p.source ? 'Run detection (Ctrl + Enter)' : 'Choose a file or a sample first'}
          aria-keyshortcuts="Control+Enter Meta+Enter"
        >
          {busy && <span className="spin" aria-hidden="true" />}
          {runLabel(p.run)}
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12 }}>
        <p className="sec-title">Run info</p>
        <div style={row}>
          <span style={{ color: 'var(--muted)' }}>Mode</span>
          <span>{(result?.mode ?? p.mode) === 'full' ? 'Full pipeline' : 'Detector only'}</span>
        </div>
        <div style={row}>
          <span style={{ color: 'var(--muted)' }}>Model</span>
          <span className="mono" title={result?.model.revision ?? p.modelRevision ?? undefined}>
            YOLO · {shortRev(result?.model.revision ?? p.modelRevision)}
          </span>
        </div>
        <div style={row}>
          <span style={{ color: 'var(--muted)' }}>Source</span>
          <span style={{ textAlign: 'right' }}>{!p.source ? '—' : p.source.type === 'sample' ? 'Bundled sample' : 'Upload'}</span>
        </div>
        {result && (
          <div style={row}>
            <span style={{ color: 'var(--muted)' }}>Time</span>
            <span className="mono">{duration(result.timings_ms.total)}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
