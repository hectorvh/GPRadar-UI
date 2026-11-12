import { boxToPercent } from '../lib/detections'
import { conf } from '../lib/format'
import type { Detection } from '../lib/types'

interface Props {
  detections: Detection[]
  selectedId: number | null
  onSelect: (id: number) => void
}

/** Label goes inside the box when the box starts in the top 8 % (it would leave the figure). */
const TOP_EDGE = 0.08

/** Boxes are real buttons positioned from box_norm in %. */
export function BoxOverlay({ detections, selectedId, onSelect }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {detections.map((d) => {
        const sel = d.id === selectedId
        const cls = 'box' + (sel ? ' sel' : '') + (d.box_norm.y_min < TOP_EDGE ? ' top' : '')
        return (
          <button
            key={d.id}
            id={`det-box-${d.id}`}
            type="button"
            className={cls}
            style={{ ...boxToPercent(d.box_norm), pointerEvents: 'auto' }}
            aria-label={`Detection ${d.id}, confidence ${conf(d.confidence)}`}
            aria-pressed={sel}
            onClick={() => onSelect(d.id)}
          >
            <span className="tag" aria-hidden="true">
              #{d.id} {conf(d.confidence)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
