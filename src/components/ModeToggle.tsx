import type { InputKind, Mode } from '../lib/types'

interface Props {
  mode: Mode
  onMode: (m: Mode) => void
  kind: InputKind | null
}

export function ModeToggle({ mode, onMode, kind }: Props) {
  const full = mode === 'full'
  return (
    <>
      <div className="seg" role="group" aria-label="Processing mode">
        <button type="button" className={full ? 'on' : ''} aria-pressed={full} onClick={() => onMode('full')}>
          Full pipeline
        </button>
        <button type="button" className={full ? '' : 'on'} aria-pressed={!full} onClick={() => onMode('detector')}>
          Detector only
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
        {full
          ? 'Time-zero, dewow, background removal and gain, then detection. For raw data.'
          : 'Only resizes and normalizes for the model. For already processed images.'}
      </p>
      {full && kind === 'image' && (
        <p role="alert" className="warn">
          This looks like an image. Preprocessing an already processed image can degrade detection.
        </p>
      )}
      {!full && kind === 'gprmax' && (
        <p role="alert" className="warn">
          Raw data without preprocessing: detections will be poor. Use Full pipeline for raw files.
        </p>
      )}
    </>
  )
}
