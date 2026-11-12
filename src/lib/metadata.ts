/** The four optional metadata fields: labels, accepted ranges, parsing. */
import { META_FIELDS, type MetaField, type MetadataInput } from './types'

export const META: Record<MetaField, { label: string; placeholder: string; min: number; max: number }> = {
  frequency_mhz: { label: 'Frequency (MHz)', placeholder: '400', min: 1, max: 10_000 },
  time_window_ns: { label: 'Time window (ns)', placeholder: 'from file', min: 0.1, max: 100_000 },
  trace_spacing_m: { label: 'Trace spacing (m)', placeholder: 'from file', min: 0.0001, max: 100 },
  velocity_m_ns: { label: 'Velocity (m/ns)', placeholder: '0.10', min: 0.01, max: 0.3 },
}

export type MetaStrings = Record<MetaField, string>

export const EMPTY_META: MetaStrings = { frequency_mhz: '', time_window_ns: '', trace_spacing_m: '', velocity_m_ns: '' }

/** Blank fields are omitted; a comma is accepted as decimal separator. */
export function parseMetadata(strings: MetaStrings): { values: MetadataInput; errors: Partial<Record<MetaField, string>> } {
  const values: MetadataInput = {}
  const errors: Partial<Record<MetaField, string>> = {}
  for (const field of META_FIELDS) {
    const raw = strings[field].trim().replace(',', '.')
    if (raw === '') continue
    const n = Number(raw)
    const { min, max } = META[field]
    if (!Number.isFinite(n)) errors[field] = 'Enter a number.'
    else if (n < min || n > max) errors[field] = `Between ${min} and ${max}.`
    else values[field] = n
  }
  return { values, errors }
}
