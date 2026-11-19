import type { InputKind, Sample } from './types'

/** What the next run analyses: a bundled sample or an uploaded file. */
export type Source = { type: 'sample'; sample: Sample } | { type: 'file'; file: File; kind: InputKind }

export function sourceKind(source: Source | null): InputKind | null {
  if (!source) return null
  return source.type === 'sample' ? source.sample.kind : source.kind
}

export function sourceTitle(source: Source | null): string {
  if (!source) return 'New analysis'
  return source.type === 'sample' ? source.sample.name : source.file.name
}

export function kindLabel(source: Source | null): string {
  if (!source) return 'No input'
  const kind = sourceKind(source)
  if (source.type === 'sample') return kind === 'image' ? 'Real scan · image' : 'Raw · gprMax (simulated)'
  return kind === 'image' ? 'Image' : 'Raw file'
}

/**
 * Short form of a sample citation for the side menu; the full text stays in a tooltip.
 * "Mojahid et al. (2025), Intelligent … Licence: CC BY 4.0." → "Mojahid et al. (2025) · CC BY 4.0"
 * "Simulated with gprMax (Warren et al. 2016)" → unchanged.
 */
export function shortCitation(citation: string): string {
  const text = citation.trim()
  const author = /^([^,(]+\(\d{4}\))/.exec(text)?.[1]
  if (!author) return text
  const licence = /Licen[cs]e:?\s*(.+?)\.?$/i.exec(text)?.[1]?.trim()
  return licence ? `${author} · ${licence}` : author
}

/** One-line description of a bundled sample's data type. */
export function sampleKindLabel(kind: InputKind): string {
  return kind === 'image' ? 'Real scan · image' : 'Simulated · gprMax'
}
