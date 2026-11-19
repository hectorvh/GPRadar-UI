import { useState, type DragEvent } from 'react'
import type { SamplesState } from '../hooks/useBackend'
import { sampleKindLabel } from '../lib/source'
import type { Sample } from '../lib/types'
import { SampleIcon } from './icons'
import { UploadDrop } from './UploadDrop'

interface Props {
  fileError: string | null
  checking: boolean
  /** Settings → View samples. */
  showSamples: boolean
  samples: SamplesState
  onPickSample: (s: Sample) => void
  onFile: (f: File) => void
  /** The detector server is still waking up: samples are not loaded yet. */
  waking: boolean
}

const STEPS = [
  ['Choose a scan', 'Run a bundled sample, or upload a PNG / JPG B-scan or a gprMax .out / .h5 file'],
  ['Process and detect', 'Raw records get time-zero, dewow, background removal and gain before the YOLO detector'],
  ['Review and export', 'Filter by confidence, inspect apex time and depth, and export CSV or an annotated PNG'],
] as const

/** First screen: what the tool does and the fastest way to try it. Replaces the empty viewer. */
export function EmptyState({ fileError, checking, showSamples, samples, onPickSample, onFile, waking }: Props) {
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
    <section
      aria-labelledby="empty-title"
      className={'empty' + (over ? ' over' : '')}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
      }}
      onDrop={onDrop}
    >
      <div className="empty-hero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <h2 id="empty-title" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
            Find buried pipes, cables and voids in GPR B‑scans
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: 560 }}>
            GPRadar finds the hyperbolas that buried objects leave in ground-penetrating radar profiles, with a YOLO model trained on real
            GPR scans. {showSamples ? 'Run a sample to see it work, or upload your own scan.' : 'Upload a scan to start.'}
          </p>
        </div>
      </div>

      <figure className="home-figure">
        <img
          src="/home-detections.png"
          width={1080}
          height={288}
          alt="Four real GPR B-scans with green hand-labelled boxes and red model detections around hyperbolas, with confidences 0.39 to 0.62."
        />
        <figcaption>
          Hand labels (green) and GPRadar detections (red, with confidence) on Mendeley train scans. Figure from the{' '}
          <a
            href="https://github.com/hectorvh/GPRadar/blob/main/figures/demo/mendeley_detections.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            GPRadar repository
          </a>
          ; data Mojahid et al. (2025), CC BY 4.0.
        </figcaption>
      </figure>

      <div className="input-step">
        <p className="sec-title">1 · Input B-Scan</p>
        <UploadDrop onFile={onFile} fileName={null} error={fileError} checking={checking} />
      </div>

      {showSamples && (
        <div>
          <p className="sec-title" style={{ marginBottom: 8 }}>
            Or try a sample
          </p>
          <div className="sample-cards">
            {samples.status === 'ok' &&
              samples.samples.map((s) => (
                <button key={s.id} type="button" className="sample-card" onClick={() => onPickSample(s)} title={s.description}>
                  <span className="sample-card-icon">
                    <SampleIcon simulated={s.kind !== 'image'} />
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1, textAlign: 'left' }}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{sampleKindLabel(s.kind)}</span>
                  </span>
                </button>
              ))}
            {samples.status === 'loading' &&
              [0, 1, 2].map((i) => <span key={i} className="skeleton" style={{ height: 62 }} aria-hidden="true" />)}
            {samples.status === 'loading' && (
              <span className="sr" aria-live="polite">
                {waking ? 'Starting the detector server…' : 'Loading samples…'}
              </span>
            )}
            {samples.status === 'error' && (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Samples are unavailable right now. You can still upload a file</p>
            )}
          </div>
        </div>
      )}

      <ol className="steps">
        {STEPS.map(([title, text], i) => (
          <li key={title}>
            <span className="step-n" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <strong style={{ display: 'block', fontWeight: 600 }}>{title}</strong>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
