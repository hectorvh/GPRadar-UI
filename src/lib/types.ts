/** Types for the GPRadar-API contract (spec section 1.3, api_version 1.1). */

export type Mode = 'full' | 'detector'
export type InputKind = 'image' | 'gprmax'
export type MetaSource = 'file' | 'user' | 'default'

export interface ModelInfo {
  repo: string
  file: string
  revision: string
  sha256: string
}

export interface Health {
  status: 'ok'
  api_version: string
  model: ModelInfo
}

export interface Sample {
  id: string
  name: string
  kind: InputKind
  default_mode: Mode
  citation: string
  description: string
}

export const META_FIELDS = ['frequency_mhz', 'time_window_ns', 'trace_spacing_m', 'velocity_m_ns'] as const
export type MetaField = (typeof META_FIELDS)[number]

/** What the client sends in the `metadata` form field. */
export type MetadataInput = Partial<Record<MetaField, number>>

export interface MetaValue {
  value: number | null
  source: MetaSource
}

export interface Box {
  x_min: number
  y_min: number
  x_max: number
  y_max: number
}

export interface Apex {
  trace: number
  sample: number
  distance_m?: number | null
  twt_ns?: number | null
  depth_m?: number | null
}

export interface Detection {
  id: number
  confidence: number
  box_px: Box
  box_norm: Box
  apex: Apex
}

export interface AxisX { unit: 'm' | 'trace'; min: number; max: number }
export interface AxisY { unit: 'ns' | 'sample'; min: number; max: number }
export interface AxisDepth { unit: 'm'; min: number; max: number; velocity_m_ns: number }

export interface Axes {
  x: AxisX
  y: AxisY
  depth: AxisDepth | null
}

export interface RunResponse {
  run_id: string
  api_version: string
  mode: Mode
  model: { repo: string; revision: string }
  input: {
    kind: InputKind
    filename: string
    width_px: number
    height_px: number
    n_traces: number
    n_samples: number
  }
  metadata: Record<MetaField, MetaValue>
  images: { raw_png?: string | null; processed_png: string }
  axes: Axes
  detections: Detection[]
  warnings: string[]
  timings_ms: { read: number; preprocess: number; inference: number; total: number }
}

export type ErrorCode =
  | 'bad_request'
  | 'not_found'
  | 'method_not_allowed'
  | 'too_large'
  | 'unsupported_type'
  | 'invalid_metadata'
  | 'rate_limited'
  | 'internal_error'
  | 'busy'
  | 'timeout'
  // client-side only
  | 'network'
  | 'aborted'
  | 'client_timeout'

export interface ErrorBody {
  error: { code: ErrorCode; message: string }
}
