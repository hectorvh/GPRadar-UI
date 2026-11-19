import { META, type MetaStrings } from '../lib/metadata'
import { META_FIELDS, type MetaField, type MetaValue } from '../lib/types'

interface Props {
  open: boolean
  onToggle: () => void
  values: MetaStrings
  onChange: (field: MetaField, value: string) => void
  errors: Partial<Record<MetaField, string>>
  /** metadata.* from the last response: shows where each value came from. */
  resolved: Record<MetaField, MetaValue> | null
}

export function MetadataForm({ open, onToggle, values, onChange, errors, resolved }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        type="button"
        className="btn ghost"
        style={{ justifyContent: 'space-between', padding: '0 4px' }}
        aria-expanded={open}
        aria-controls="meta-fields"
        onClick={onToggle}
      >
        <span className="sec-title">
          3 · Metadata <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional)</span>
        </span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div id="meta-fields" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {META_FIELDS.map((f) => {
              const r = resolved?.[f]
              const placeholder = r?.value != null && r.source !== 'user' ? String(Number(r.value.toPrecision(4))) : META[f].placeholder
              return (
                <div className="field" key={f}>
                  <label htmlFor={`m-${f}`}>
                    {META[f].label}{' '}
                    {r && (
                      <span className="src" title={`Value used in the last run came from: ${r.source}`}>
                        {r.source}
                      </span>
                    )}
                  </label>
                  <input
                    id={`m-${f}`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={placeholder}
                    value={values[f]}
                    aria-invalid={errors[f] ? true : undefined}
                    aria-describedby={errors[f] ? `m-${f}-err` : undefined}
                    onChange={(e) => onChange(f, e.target.value)}
                  />
                  {errors[f] && (
                    <span className="field-error" id={`m-${f}-err`}>
                      {errors[f]}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
            Leave blank to use values from the file header or defaults. A value in the file header takes precedence over yours
          </p>
        </div>
      )}
    </div>
  )
}
