import { niceTicks } from '../lib/format'
import type { Axes as AxesT } from '../lib/types'

/** Tick labels around the image, from response.axes (time/samples, distance/traces, depth).
 *  `compact`: phones, labels in a 28 px gutter at 10 px. */
export function Axes({ axes, compact = false }: { axes: AxesT; compact?: boolean }) {
  const gutter = compact ? 28 : 44
  const width = compact ? 24 : 36
  const tick = { fontSize: compact ? 10 : 11, color: 'var(--muted)' } as const
  return (
    <div aria-hidden="true">
      {niceTicks(axes.y.min, axes.y.max).map((t) => (
        <span
          key={`y${t.value}`}
          className="mono"
          style={{ ...tick, position: 'absolute', left: -gutter, top: `${t.pct}%`, transform: 'translateY(-50%)', width, textAlign: 'right' }}
        >
          {t.label}
        </span>
      ))}
      {axes.depth &&
        niceTicks(axes.depth.min, axes.depth.max).map((t) => (
          <span
            key={`d${t.value}`}
            className="mono"
            style={{ ...tick, position: 'absolute', right: -gutter, top: `${t.pct}%`, transform: 'translateY(-50%)', width }}
          >
            {t.label}
          </span>
        ))}
      {niceTicks(axes.x.min, axes.x.max).map((t) => (
        <span
          key={`x${t.value}`}
          className="mono"
          style={{ ...tick, position: 'absolute', bottom: compact ? -16 : -20, left: `${t.pct}%`, transform: 'translateX(-50%)' }}
        >
          {t.label}
        </span>
      ))}
    </div>
  )
}
