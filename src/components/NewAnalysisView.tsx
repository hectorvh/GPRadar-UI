import { useState, type DragEvent } from 'react'
import type { Project } from '../lib/library'
import type { InputKind } from '../lib/types'
import { ACCEPT } from '../lib/validate'
import { AnalysisIcon, TrashIcon, UploadIcon } from './icons'

/** A B-scan chosen for a project's New analysis, not run yet. */
export interface DraftItem {
  key: string
  label: string
  kind: InputKind
  file?: File
  sampleId?: string
}

interface Props {
  project: Project
  items: DraftItem[]
  /** Files that failed the client checks when added (name: reason). */
  rejected: string[]
  /** Label of the mode that will be used for every B-scan. */
  modeLabel: string
  canRun: boolean
  onAddFiles: (files: File[]) => void
  onRemove: (key: string) => void
  onRun: () => void
  onCancel: () => void
}

/** New analysis inside a project: pick several B-scans, run them all with one setup. */
export function NewAnalysisView(p: Props) {
  const [over, setOver] = useState(false)

  const onDragOver = (e: DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes('Files')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setOver(true)
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const files = Array.from(e.dataTransfer.files ?? [])
    if (files.length) p.onAddFiles(files)
  }

  return (
    <section
      aria-labelledby="new-analysis-title"
      className={'project-view' + (over ? ' over' : '')}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
      }}
      onDrop={onDrop}
    >
      <div>
        <p className="sec-title">New analysis in {p.project.name}</p>
        <h2 id="new-analysis-title" style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 4px' }}>
          Choose one or more B-scans
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          They all run with the same setup from steps 2 and 3 on the right (now: {p.modeLabel}), one after another, and appear in the
          project window, where each can be exported on its own or together as the project.
        </p>
      </div>

      <p className="sec-title" style={{ marginBottom: -8 }}>
        1 · Input B-Scans
      </p>
      <input
        id="new-analysis-upload"
        className="sr"
        type="file"
        multiple
        accept={ACCEPT}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) p.onAddFiles(files)
          e.target.value = ''
        }}
      />
      <label htmlFor="new-analysis-upload" className="drop" style={{ padding: 24 }}>
        <UploadIcon />
        <span style={{ fontWeight: 500, color: 'var(--text)' }}>Drop or browse (several files)</span>
        <span style={{ fontSize: 12 }}>Raw (.out, .h5) or PNG / JPG</span>
      </label>

      {p.rejected.length > 0 && (
        <div className="warn" role="alert">
          Not added:
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            {p.rejected.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="sec-title" style={{ marginBottom: 8 }}>
          Selected ({p.items.length})
        </p>
        {p.items.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Nothing selected yet</p>
        ) : (
          <ul className="draft-list">
            {p.items.map((i) => (
              <li key={i.key}>
                <AnalysisIcon />
                <span className="draft-name">{i.label}</span>
                <span className="chip">{i.kind === 'image' ? 'Image' : 'Raw'}</span>
                <button type="button" className="btn sm ghost icon" aria-label={`Remove ${i.label}`} onClick={() => p.onRemove(i.key)}>
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button type="button" className="btn ghost" onClick={p.onCancel}>
          Cancel
        </button>
        <button type="button" className="btn primary" disabled={!p.canRun} onClick={p.onRun}>
          Run {p.items.length || ''} B-scan{p.items.length === 1 ? '' : 's'}
        </button>
      </div>
    </section>
  )
}
