/** Test fixtures shaped like GPRadar-API 1.1 responses. */
import type { Detection, RunResponse } from './types'

export function det(id: number, confidence: number, extra: Partial<Detection> = {}): Detection {
  return {
    id,
    confidence,
    box_px: { x_min: 10 * id, y_min: 5, x_max: 10 * id + 40, y_max: 60 },
    box_norm: { x_min: 0.1, y_min: 0.02, x_max: 0.3, y_max: 0.27 },
    apex: { trace: 12.5, sample: 30, distance_m: 0.25, twt_ns: 1.1, depth_m: 0.055 },
    ...extra,
  }
}

/** A minimal RunResponse for library and zip tests. */
export function runResult(filename = 'scan.png', detections: Detection[] = [det(1, 0.9), det(2, 0.1)]): RunResponse {
  const meta = { value: null, source: 'default' as const }
  return {
    run_id: `run-${filename}`,
    api_version: '1.1',
    mode: 'detector',
    model: { repo: 'hectorvh/gpradar-hyperbola-yolo', revision: 'abc1234' },
    input: { kind: 'image', filename, width_px: 224, height_px: 224, n_traces: 224, n_samples: 224 },
    metadata: { frequency_mhz: meta, time_window_ns: meta, trace_spacing_m: meta, velocity_m_ns: { value: 0.1, source: 'default' } },
    images: { processed_png: '' },
    axes: { x: { unit: 'trace', min: 0, max: 224 }, y: { unit: 'sample', min: 0, max: 224 }, depth: null },
    detections,
    warnings: [],
    timings_ms: { read: 1, preprocess: 1, inference: 1, total: 3 },
  }
}
