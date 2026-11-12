import { niceTicks } from '../lib/format'
import type { Axes as AxesT } from '../lib/types'

const tick = { fontSize: 11, color: 'var(--muted)' } as const

/** Tick labels around the image, from response.axes (time/samples, distance/traces, depth). */
export function Axes({ axes }: { axes: AxesT }) {
  return (
    <div aria-hidden="true">
      {niceTicks(axes.y.min, axes.y.max).map((t) => (
        <span
          key={`y${t.value}`}
          className="mono"
          style={{ ...tick, position: 'absolute', left: -44, top: `${t.pct}%`, transform: 'translateY(-50%)', width: 36, textAlign: 'right' }}
        >
          {t.label}
        </span>
      ))}
      {axes.depth &&
        niceTicks(axes.depth.min, axes.depth.max).map((t) => (
          <span
            key={`d${t.value}`}
            className="mono"
            style={{ ...tick, position: 'absolute', right: -44, top: `${t.pct}%`, transform: 'translateY(-50%)', width: 36 }}
          >
            {t.label}
          </span>
        ))}
      {niceTicks(axes.x.min, axes.x.max).map((t) => (
        <span
          key={`x${t.value}`}
          className="mono"
          style={{ ...tick, position: 'absolute', bottom: -20, left: `${t.pct}%`, transform: 'translateX(-50%)' }}
        >
          {t.label}
        </span>
      ))}
    </div>
  )
}
