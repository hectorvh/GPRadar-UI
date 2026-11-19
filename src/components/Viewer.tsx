import { useEffect, useRef, type KeyboardEvent } from 'react'
import { THRESHOLD_MAX, THRESHOLD_MIN, THRESHOLD_STEP, parseThreshold, shownLabel } from '../lib/detections'
import { AXIS_LABEL, fixed } from '../lib/format'
import type { Detection, Mode, RunResponse } from '../lib/types'
import { Axes } from './Axes'
import { BoxOverlay } from './BoxOverlay'

export type View = 'raw' | 'processed'

interface Props {
  result: RunResponse | null
  mode: Mode
  view: View
  onView: (v: View) => void
  threshold: number
  onThreshold: (t: number) => void
  shown: Detection[]
  selectedId: number | null
  /** Set when the selection came from the table: scroll the box into view. */
  scrollToId: number | null
  onSelect: (id: number) => void
  placeholder: string
  /** A run is in progress: animate the placeholder. */
  busy: boolean
  /** Set when an input is chosen but not run yet: shows a Run button in the placeholder. */
  onRun: (() => void) | null
  canRun: boolean
}

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/
const dataUrl = (b64: string | null | undefined) => (b64 && BASE64.test(b64) ? `data:image/png;base64,${b64}` : null)

export function Viewer(p: Props) {
  const { result } = p
  const raw = dataUrl(result?.images.raw_png)
  const processed = dataUrl(result?.images.processed_png)
  // Raw/Processed tabs when the API returned both images (full pipeline); else one "Input" tab.
  const twoTabs = result ? !!raw : p.mode === 'full'
  const view: View = twoTabs ? p.view : 'processed'
  const src = view === 'raw' ? raw : processed
  const total = result?.detections.length ?? 0
  const w = result?.input.width_px ?? 2
  const h = result?.input.height_px ?? 1
  const rawTab = useRef<HTMLButtonElement>(null)
  const procTab = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (p.scrollToId != null) document.getElementById(`det-box-${p.scrollToId}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [p.scrollToId])

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next: View = view === 'raw' ? 'processed' : 'raw'
    p.onView(next)
    ;(next === 'raw' ? rawTab : procTab).current?.focus()
  }

  const axes = result?.axes
  const velocity = result?.metadata.velocity_m_ns

  return (
    <section
      id="viewer"
      className="viewer"
      aria-label="Radargram viewer"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: '6px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div role="tablist" aria-label="View" style={{ display: 'flex', gap: 4 }} onKeyDown={twoTabs ? onTabKey : undefined}>
          {twoTabs ? (
            <>
              <button
                ref={rawTab}
                id="tab-raw"
                role="tab"
                type="button"
                className={'tab' + (view === 'raw' ? ' on' : '')}
                aria-selected={view === 'raw'}
                aria-controls="radargram"
                tabIndex={view === 'raw' ? 0 : -1}
                onClick={() => p.onView('raw')}
              >
                Raw
              </button>
              <button
                ref={procTab}
                id="tab-processed"
                role="tab"
                type="button"
                className={'tab' + (view === 'processed' ? ' on' : '')}
                aria-selected={view === 'processed'}
                aria-controls="radargram"
                tabIndex={view === 'processed' ? 0 : -1}
                onClick={() => p.onView('processed')}
              >
                Processed
              </button>
            </>
          ) : (
            <button id="tab-processed" role="tab" type="button" className="tab on" aria-selected="true" aria-controls="radargram">
              Input
            </button>
          )}
        </div>
        <div className="viewer-tools" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <label htmlFor="thr" style={{ fontSize: 13, color: 'var(--muted)' }}>
            Confidence ≥
          </label>
          <input
            id="thr"
            type="range"
            min={THRESHOLD_MIN}
            max={THRESHOLD_MAX}
            step={THRESHOLD_STEP}
            value={p.threshold}
            aria-valuetext={p.threshold.toFixed(2)}
            onChange={(e) => p.onThreshold(parseThreshold(e.target.value))}
          />
          <span className="mono" style={{ fontSize: 13, width: 36 }}>
            {p.threshold.toFixed(2)}
          </span>
          <span className="chip" aria-live="polite">
            {shownLabel(p.shown.length, total)}
          </span>
        </div>
      </div>

      <figure
        id="radargram"
        role="tabpanel"
        aria-labelledby={view === 'raw' ? 'tab-raw' : 'tab-processed'}
        style={{ margin: 0, padding: '16px 56px 40px 56px', position: 'relative' }}
      >
        {/* Native aspect ratio, at most 62 % of the viewport high. */}
        <div style={{ position: 'relative', width: `min(100%, calc(62vh * ${w / h}))`, margin: '0 auto' }}>
          <div style={{ position: 'relative', aspectRatio: `${w} / ${h}`, borderRadius: 4, overflow: 'hidden', background: '#7d7d7d' }}>
            {src ? (
              <img
                className="radargram-img"
                src={src}
                alt={`${view === 'raw' ? 'Raw' : 'Processed'} B-scan radargram, ${w} × ${h} px`}
                draggable={false}
              />
            ) : (
              <div className="placeholder" role="status" style={{ flexDirection: 'column', gap: 12 }}>
                {p.busy && <span className="spin" aria-hidden="true" style={{ width: 22, height: 22, color: 'var(--accent)' }} />}
                <span>{p.placeholder}</span>
                {p.onRun && (
                  <button type="button" className="btn primary" onClick={p.onRun} disabled={!p.canRun}>
                    Run detection
                  </button>
                )}
              </div>
            )}
          </div>
          {result && <BoxOverlay detections={p.shown} selectedId={p.selectedId} onSelect={p.onSelect} />}
          {axes && <Axes axes={axes} />}
        </div>
        <figcaption
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 26,
            fontSize: 12,
            color: 'var(--muted)',
          }}
        >
          {axes ? (
            <>
              <span>↕ {AXIS_LABEL[axes.y.unit]}</span>
              <span>→ {AXIS_LABEL[axes.x.unit]}</span>
              {axes.depth ? (
                <span>
                  Approx. depth (m) at v = {fixed(axes.depth.velocity_m_ns, 2)} m/ns{velocity ? `, ${velocity.source}` : ''} ↕
                </span>
              ) : (
                <span>No depth axis: time window unknown</span>
              )}
            </>
          ) : (
            <>
              <span>↕ Two-way time (ns)</span>
              <span>→ Distance (m)</span>
              <span>Approx. depth (m) ↕</span>
            </>
          )}
        </figcaption>
      </figure>
    </section>
  )
}
