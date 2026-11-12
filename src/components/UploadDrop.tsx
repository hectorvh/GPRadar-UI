import { useState, type DragEvent } from 'react'
import { ACCEPT } from '../lib/validate'
import { UploadIcon } from './icons'

interface Props {
  onFile: (file: File) => void
  fileName: string | null
  error: string | null
  checking: boolean
}

/** Drag-and-drop + file input. Checks run in the parent (validate.ts). */
export function UploadDrop({ onFile, fileName, error, checking }: Props) {
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
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  return (
    <>
      <input
        id="upload"
        className="sr"
        type="file"
        accept={ACCEPT}
        aria-describedby="upload-help upload-status"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = '' // allow choosing the same file again
        }}
      />
      <label
        className={'drop' + (over ? ' over' : '')}
        htmlFor="upload"
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <UploadIcon />
        <span style={{ fontWeight: 500, color: 'var(--text)' }}>Drop a B-scan or browse</span>
        <span id="upload-help" style={{ fontSize: 12 }}>
          Raw gprMax (.out, .h5) or PNG / JPG
        </span>
      </label>
      <div id="upload-status" aria-live="polite" style={{ fontSize: 12 }}>
        {checking && <span style={{ color: 'var(--muted)' }}>Checking file…</span>}
        {!checking && fileName && !error && (
          <span style={{ color: 'var(--muted)' }}>
            Selected: <span style={{ color: 'var(--text)', overflowWrap: 'anywhere' }}>{fileName}</span>
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="warn">
          {error}
        </p>
      )}
    </>
  )
}
