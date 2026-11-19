/**
 * Logo option E (design/brand/logo-options.html): viewfinder brackets around a
 * radar hyperbola, one colour, no background tile, no opacity.
 *
 * The single source of the drawing and its colours. Used by LogoIcon and the
 * mini icons (src/components/icons.tsx) and by scripts/render-brand.mjs, which
 * writes public/favicon.svg, the design/brand SVGs and the PNG icons from it
 * (npm run brand). brand.test.ts checks the files against these values.
 */

/** Mark colours. */
export const MARK_LIGHT = '#00293A' // light mode (and home-screen icons)
export const MARK_DARK = '#C4FFFB' // dark mode (and the link preview)
/** Opaque backgrounds where the OS or a preview needs one. */
export const ICON_BG = '#F5F7F8' // home-screen icons: the light page colour
export const PREVIEW_BG = '#001A25' // link preview: the dark page colour

/** The logo on a 32 x 32 grid, shown through this viewBox (the mark without margin). */
export const LOGO_VIEWBOX = '3.5 3.5 25 25'
export const LOGO_STROKE = 2
export const LOGO_HYP_STROKE = 2.4

/** Four viewfinder brackets (top left, top right, bottom right, bottom left). */
export const LOGO_BRACKETS = ['M5 10V5h5', 'M22 5h5v5', 'M27 22v5h-5', 'M10 27H5v-5'] as const

/** The hyperbola (apex at 16, 12), 41 points. */
export const LOGO_HYPERBOLA =
  'M8.00 22.35 L8.40 21.62 L8.80 20.90 L9.20 20.19 L9.60 19.49 L10.00 18.79 L10.40 18.11 L10.80 17.45 L11.20 16.80 L11.60 16.17 L12.00 15.56 L12.40 14.98 L12.80 14.43 L13.20 13.92 L13.60 13.45 L14.00 13.04 L14.40 12.68 L14.80 12.39 L15.20 12.18 L15.60 12.04 L16.00 12.00 L16.40 12.04 L16.80 12.18 L17.20 12.39 L17.60 12.68 L18.00 13.04 L18.40 13.45 L18.80 13.92 L19.20 14.43 L19.60 14.98 L20.00 15.56 L20.40 16.17 L20.80 16.80 L21.20 17.45 L21.60 18.11 L22.00 18.79 L22.40 19.49 L22.80 20.19 L23.20 20.90 L23.60 21.62 L24.00 22.35'

/** Mini icons (32 x 32, stroke 2.6) reuse the logo's lines. */
export const MINI_STROKE = 2.6
/** Analysis: the logo's brackets with slightly longer arms. */
export const MINI_ANALYSIS_BRACKETS = 'M5 11V5h6M21 5h6v6M27 21v6h-6M11 27H5v-6'
/** Project: a frame behind a smaller logo mark. */
export const MINI_PROJECT_FRAME = 'M10 3h17a2 2 0 0 1 2 2v17'
export const MINI_PROJECT_BRACKETS = 'M3 12V8h4M19 8h4v4M23 25v4h-4M7 29H3v-4'
export const MINI_PROJECT_HYPERBOLA =
  'M6.50 23.55 L7.15 22.37 L7.80 21.21 L8.45 20.09 L9.10 19.00 L9.75 17.98 L10.40 17.04 L11.05 16.22 L11.70 15.57 L12.35 15.15 L13.00 15.00 L13.65 15.15 L14.30 15.57 L14.95 16.22 L15.60 17.04 L16.25 17.98 L16.90 19.00 L17.55 20.09 L18.20 21.21 L18.85 22.37 L19.50 23.55'
/** Sample: a scan frame with a smaller hyperbola. */
export const MINI_SAMPLE_HYPERBOLA =
  'M9.00 20.59 L9.58 19.68 L10.17 18.79 L10.75 17.92 L11.33 17.08 L11.92 16.28 L12.50 15.53 L13.08 14.84 L13.67 14.23 L14.25 13.72 L14.83 13.33 L15.42 13.08 L16.00 13.00 L16.58 13.08 L17.17 13.33 L17.75 13.72 L18.33 14.23 L18.92 14.84 L19.50 15.53 L20.08 16.28 L20.67 17.08 L21.25 17.92 L21.83 18.79 L22.42 19.68 L23.00 20.59'

// ---- SVG files (written by scripts/render-brand.mjs) ----

const ATTRS = `fill="none" stroke-width="${LOGO_STROKE}" stroke-linecap="round" stroke-linejoin="round"`
const PATHS =
  LOGO_BRACKETS.map((d) => `<path d="${d}"/>`).join('') + `<path d="${LOGO_HYPERBOLA}" stroke-width="${LOGO_HYP_STROKE}"/>`
const XMLNS = 'xmlns="http://www.w3.org/2000/svg"'

/** design/brand/logo-mark.svg (MARK_LIGHT) and logo-mark-dark.svg (MARK_DARK). */
export function logoMarkSvg(color: string): string {
  return `<svg ${XMLNS} viewBox="${LOGO_VIEWBOX}"><title>GPRadar</title><g ${ATTRS.replace('fill="none"', `fill="none" stroke="${color}"`)}>${PATHS}</g></svg>\n`
}

/** public/favicon.svg: one mark that follows the browser's colour scheme. */
export function faviconSvg(): string {
  return `<svg ${XMLNS} viewBox="${LOGO_VIEWBOX}"><title>GPRadar</title><style>.m{stroke:${MARK_LIGHT}}@media (prefers-color-scheme:dark){.m{stroke:${MARK_DARK}}}</style><g class="m" ${ATTRS}>${PATHS}</g></svg>\n`
}

/** design/brand/icon-full-bleed.svg: square, opaque, for home-screen icons (mark at 72 %). */
export function iconFullBleedSvg(): string {
  return `<svg ${XMLNS} viewBox="0 0 32 32"><rect width="32" height="32" fill="${ICON_BG}"/><g transform="translate(16 16) scale(.72) translate(-16 -16)" ${ATTRS.replace('fill="none"', `fill="none" stroke="${MARK_LIGHT}"`)}>${PATHS}</g></svg>\n`
}
