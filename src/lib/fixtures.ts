/** Test fixtures shaped like GPRadar-API 1.1 responses. */
import type { Detection } from './types'

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
