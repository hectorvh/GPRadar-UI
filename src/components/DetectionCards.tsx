import { useEffect } from 'react'
import { shownLabel } from '../lib/detections'
import { DASH, fixed } from '../lib/format'
import { revealElement } from '../lib/scroll'
import type { Detection } from '../lib/types'
import { ConfBar, DetectionsMessage } from './DetectionParts'

interface Props {
  /** Detections at or above the threshold (as for DetectionsTable). */
  shown: Detection[]
  total: number | null
  selectedId: number | null
  /** Set when the selection came from a box: scroll the card into view. */
  scrollToId: number | null
  onSelect: (id: number) => void
  threshold: number
}

/**
 * Detections on phones: one card per detection instead of the table, same data
 * and selection. Exports live in the bottom action bar.
 */
export function DetectionCards({ shown, total, selectedId, scrollToId, onSelect, threshold }: Props) {
  useEffect(() => {
    if (scrollToId != null) revealElement(document.getElementById(`det-card-${scrollToId}`))
  }, [scrollToId])

  return (
    <section aria-label="Detections" className="det-cards-wrap">
      <h2 style={{ margin: 0, padding: '12px 14px', fontSize: 15, fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
        Detections <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {shownLabel(shown.length, total ?? 0)}</span>
      </h2>
      {shown.length > 0 && (
        <ul className="det-cards">
          {shown.map((d) => {
            const sel = d.id === selectedId
            return (
              <li key={d.id} id={`det-card-${d.id}`} data-id={d.id}>
                <button type="button" className={'det-card' + (sel ? ' sel' : '')} aria-pressed={sel} onClick={() => onSelect(d.id)}>
                  <span className="det-card-top">
                    <span className="mono det-card-id">#{d.id}</span>
                    <ConfBar value={d.confidence} />
                  </span>
                  <span className="det-card-vals">
                    <span>
                      <span className="det-card-label">Apex distance (m)</span>
                      <span className="mono" data-field="distance">
                        {fixed(d.apex.distance_m, 2)}
                      </span>
                    </span>
                    <span>
                      <span className="det-card-label">TWT (ns)</span>
                      <span className="mono" data-field="twt">
                        {fixed(d.apex.twt_ns, 1)}
                      </span>
                    </span>
                    <span>
                      <span className="det-card-label">Depth (m)</span>
                      <span className="mono" data-field="depth">
                        {d.apex.depth_m == null ? DASH : `≈ ${fixed(d.apex.depth_m, 2)}`}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <DetectionsMessage total={total} shown={shown.length} threshold={threshold} />
    </section>
  )
}
