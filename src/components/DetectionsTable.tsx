import { useEffect } from 'react'
import { shownLabel } from '../lib/detections'
import { DASH, fixed } from '../lib/format'
import type { Detection } from '../lib/types'
import { ConfBar, DetectionsMessage } from './DetectionParts'
import { DownloadIcon } from './icons'

interface Props {
  shown: Detection[]
  total: number | null
  selectedId: number | null
  /** Set when the selection came from a box: scroll the row into view. */
  scrollToId: number | null
  onSelect: (id: number) => void
  onCsv: () => void
  onPng: () => void
  exporting: boolean
  threshold: number
}

const r0 = (v: number) => Math.round(v)

export function DetectionsTable({ shown, total, selectedId, scrollToId, onSelect, onCsv, onPng, exporting, threshold }: Props) {
  useEffect(() => {
    if (scrollToId != null) document.getElementById(`det-row-${scrollToId}`)?.scrollIntoView({ block: 'nearest' })
  }, [scrollToId])

  const hasResult = total != null
  const label = shownLabel(shown.length, total ?? 0)

  return (
    <section aria-label="Detections" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
          Detections <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {label}</span>
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn" disabled={!hasResult} onClick={onCsv}>
            <DownloadIcon />
            CSV
          </button>
          <button type="button" className="btn" disabled={!hasResult || exporting} onClick={onPng} aria-busy={exporting}>
            <DownloadIcon />
            Annotated PNG
          </button>
        </div>
      </div>
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <table className="det">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Confidence</th>
              <th scope="col">Apex distance (m)</th>
              <th scope="col">Apex TWT (ns)</th>
              <th scope="col">Est. depth (m)</th>
              <th scope="col">Box (px)</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => (
              <tr key={d.id} id={`det-row-${d.id}`} className={d.id === selectedId ? 'sel' : ''}>
                <td>
                  <button type="button" className="rowbtn" onClick={() => onSelect(d.id)} aria-label={`Select detection ${d.id}`} aria-pressed={d.id === selectedId}>
                    #{d.id}
                  </button>
                </td>
                <td>
                  <ConfBar value={d.confidence} />
                </td>
                <td className="mono">{fixed(d.apex.distance_m, 2)}</td>
                <td className="mono">{fixed(d.apex.twt_ns, 1)}</td>
                <td className="mono">{d.apex.depth_m == null ? DASH : `≈ ${fixed(d.apex.depth_m, 2)}`}</td>
                <td className="mono" style={{ color: 'var(--muted)' }}>
                  {r0(d.box_px.x_min)}–{r0(d.box_px.x_max)}, {r0(d.box_px.y_min)}–{r0(d.box_px.y_max)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DetectionsMessage total={total} shown={shown.length} threshold={threshold} />
    </section>
  )
}
