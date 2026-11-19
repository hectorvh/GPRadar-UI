import type { RunState } from '../hooks/useRun'
import { runLabel } from '../lib/runLabel'
import { DownloadIcon, GearIcon, PlusIcon } from './icons'

type Props =
  /** Input chosen, before or during a run: Settings (bottom sheet) and Run detection. */
  | { kind: 'setup'; run: RunState; canRun: boolean; onRun: () => void; onSettings: () => void }
  /** A project's New analysis: Settings and Run N B-scans. */
  | { kind: 'batch'; count: number; canRun: boolean; onRun: () => void; onSettings: () => void }
  /** A result on screen: Export (CSV, annotated PNG) and New analysis. */
  | { kind: 'result'; exportOpen: boolean; exporting: boolean; onExport: (anchor: HTMLElement) => void; onNewAnalysis: () => void }

/** Phones: actions pinned to the bottom of the screen. */
export function ActionBar(p: Props) {
  if (p.kind === 'result') {
    return (
      <div className="action-bar">
        <button
          type="button"
          className="btn"
          aria-haspopup="menu"
          aria-expanded={p.exportOpen}
          aria-busy={p.exporting}
          onClick={(e) => p.onExport(e.currentTarget)}
        >
          {p.exporting ? <span className="spin" aria-hidden="true" /> : <DownloadIcon />}
          Export
        </button>
        <button type="button" className="btn primary grow" onClick={p.onNewAnalysis}>
          <PlusIcon />
          New analysis
        </button>
      </div>
    )
  }

  const settings = (
    <button type="button" className="btn" aria-haspopup="dialog" onClick={p.onSettings}>
      <GearIcon />
      Settings
    </button>
  )

  if (p.kind === 'batch') {
    return (
      <div className="action-bar">
        {settings}
        <button type="button" className="btn primary grow" disabled={!p.canRun} onClick={p.onRun}>
          Run {p.count || ''} B-scan{p.count === 1 ? '' : 's'}
        </button>
      </div>
    )
  }

  const busy = p.run.status === 'queued' || p.run.status === 'uploading' || p.run.status === 'running'
  return (
    <div className="action-bar">
      {settings}
      <button type="button" className="btn primary grow" disabled={!p.canRun || busy} aria-busy={busy} onClick={p.onRun}>
        {busy && <span className="spin" aria-hidden="true" />}
        {runLabel(p.run)}
      </button>
    </div>
  )
}
