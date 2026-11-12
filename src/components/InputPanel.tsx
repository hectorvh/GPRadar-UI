import type { SamplesState } from '../hooks/useBackend'
import type { RunState } from '../hooks/useRun'
import { duration, shortRev } from '../lib/format'
import type { MetaStrings } from '../lib/metadata'
import { shortSampleName, sourceKind, type Source } from '../lib/source'
import type { MetaField, Mode, Sample } from '../lib/types'
import { MetadataForm } from './MetadataForm'
import { ModeToggle } from './ModeToggle'
import { UploadDrop } from './UploadDrop'

interface Props {
  width: number
  source: Source | null
  samples: SamplesState
  onPickSample: (s: Sample) => void
  onFile: (f: File) => void
  fileError: string | null
  checkingFile: boolean
  mode: Mode
  onMode: (m: Mode) => void
  metaOpen: boolean
  onToggleMeta: () => void
  meta: MetaStrings
  onMeta: (f: MetaField, v: string) => void
  metaErrors: Partial<Record<MetaField, string>>
  run: RunState
  onRun: () => void
  canRun: boolean
  modelRevision: string | null
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
      className="panel scroll"
      aria-label="Input and processing"
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
        <p className="sec-title">1 · Input</p>
        <UploadDrop
          onFile={p.onFile}
          fileName={p.source?.type === 'file' ? p.source.file.name : null}
          error={p.fileError}
          checking={p.checkingFile}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Try a sample:</span>
          {p.samples.status === 'ok' ? (
            p.samples.samples.map((s) => (
              <button key={s.id} type="button" className="btn sm" title={s.name} onClick={() => p.onPickSample(s)}>
                {shortSampleName(s.name)}
              </button>
            ))
          ) : (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.samples.status === 'error' ? 'unavailable' : 'loading…'}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p className="sec-title">2 · Processing</p>
        <ModeToggle mode={p.mode} onMode={p.onMode} kind={kind} />
      </div>

      <MetadataForm
        open={p.metaOpen}
        onToggle={p.onToggleMeta}
        values={p.meta}
        onChange={p.onMeta}
        errors={p.metaErrors}
        resolved={result?.metadata ?? null}
      />

      <button
        type="button"
        className="btn primary"
        style={{ minHeight: 44, fontSize: 15 }}
        onClick={p.onRun}
        disabled={!p.canRun || busy}
        aria-busy={busy}
        title={p.source ? undefined : 'Choose a file or a sample first'}
      >
        {busy && <span className="spin" aria-hidden="true" />}
        {runLabel(p.run)}
      </button>

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
