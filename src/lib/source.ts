import type { InputKind, Sample } from './types'

/** What the next run analyses: a bundled sample or an uploaded file. */
export type Source =
  | { type: 'sample'; sample: Sample }
  | { type: 'file'; file: File; kind: InputKind }

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

/** "Mendeley utility (utility_0028)" → "Mendeley utility" for the short sample buttons. */
export function shortSampleName(name: string): string {
  return name.replace(/\s*\(.*\)\s*$/, '') || name
}
