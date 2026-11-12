/** Annotated PNG made in the browser: image + boxes + labels + axes + footer. */
import { filterByThreshold } from './detections'
import { AXIS_LABEL, conf, fixed, niceTicks, shortRev } from './format'
import type { RunResponse } from './types'

const INK = '#00293A'
const MUTED = '#4A5F69'
const BG = '#FFFFFF'
const BOX = '#F28C28'
const LABEL_INK = '#1A1A1A'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const SANS = '"Inter Variable", Inter, system-ui, sans-serif'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('could not decode the processed image'))
    img.src = src
  })
}

export async function annotatedPng(result: RunResponse, threshold: number): Promise<Blob> {
  const img = await loadImage(`data:image/png;base64,${result.images.processed_png}`)
  await Promise.all([document.fonts.load(`500 11px ${MONO}`), document.fonts.load(`500 12px ${SANS}`)]).catch(() => {})

  const w = img.naturalWidth
  const h = img.naturalHeight
  // Native pixels, enlarged by a whole factor so labels stay legible on small (224 px) images.
  const scale = Math.max(1, Math.floor(900 / Math.max(w, h)))
  const iw = w * scale
  const ih = h * scale
  const { axes } = result
  const L = 64
  const R = axes.depth ? 64 : 20
  const T = 32
  const B = 48
  const F = 30
  const canvas = document.createElement('canvas')
  canvas.width = L + iw + R
  canvas.height = T + ih + B + F
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2D context unavailable')

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, L, T, iw, ih)
  ctx.strokeStyle = MUTED
  ctx.lineWidth = 1
  ctx.strokeRect(L - 0.5, T - 0.5, iw + 1, ih + 1)

  // Axes
  ctx.font = `400 11px ${MONO}`
  ctx.fillStyle = MUTED
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'right'
  for (const t of niceTicks(axes.y.min, axes.y.max)) {
    const y = T + (t.pct / 100) * ih
    ctx.fillText(t.label, L - 8, y)
    ctx.fillRect(L - 4, Math.round(y), 4, 1)
  }
  if (axes.depth) {
    ctx.textAlign = 'left'
    for (const t of niceTicks(axes.depth.min, axes.depth.max)) {
      const y = T + (t.pct / 100) * ih
      ctx.fillText(t.label, L + iw + 8, y)
      ctx.fillRect(L + iw, Math.round(y), 4, 1)
    }
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (const t of niceTicks(axes.x.min, axes.x.max)) {
    const x = L + (t.pct / 100) * iw
    ctx.fillText(t.label, x, T + ih + 6)
    ctx.fillRect(Math.round(x), T + ih, 1, 4)
  }
  ctx.font = `500 11px ${SANS}`
  ctx.textAlign = 'left'
  const titles = [`↕ ${AXIS_LABEL[axes.y.unit]}`, `→ ${AXIS_LABEL[axes.x.unit]}`]
  if (axes.depth) titles.push(`Depth (m, approx.) at v = ${fixed(axes.depth.velocity_m_ns, 2)} m/ns`)
  ctx.fillText(titles.join('   ·   '), L, T + ih + 26)

  // Boxes and labels
  const shown = filterByThreshold(result.detections, threshold)
  ctx.lineWidth = 2
  ctx.font = `500 11px ${MONO}`
  ctx.textBaseline = 'middle'
  for (const d of shown) {
    const b = d.box_norm
    const x = L + b.x_min * iw
    const y = T + b.y_min * ih
    ctx.strokeStyle = BOX
    ctx.strokeRect(x, y, (b.x_max - b.x_min) * iw, (b.y_max - b.y_min) * ih)
    const text = `#${d.id} ${conf(d.confidence)}`
    const tw = ctx.measureText(text).width + 12
    const ly = Math.max(0, y - 20)
    ctx.fillStyle = BOX
    ctx.fillRect(x - 1, ly, tw, 18)
    ctx.fillStyle = LABEL_INK
    ctx.textAlign = 'left'
    ctx.fillText(text, x + 5, ly + 9)
  }

  // Footer
  ctx.fillStyle = INK
  ctx.font = `500 12px ${SANS}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(
    `GPRadar · model ${shortRev(result.model.revision)} · conf ≥ ${conf(threshold)} · prototype, verify independently`,
    L,
    canvas.height - F / 2,
  )

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png'),
  )
}
