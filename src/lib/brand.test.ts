/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  ICON_BG,
  LOGO_BRACKETS,
  LOGO_HYPERBOLA,
  MARK_DARK,
  MARK_LIGHT,
  PREVIEW_BG,
  faviconSvg,
  iconFullBleedSvg,
  logoMarkSvg,
} from './brand'

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8')
const hexes = (text: string) => [...new Set([...text.matchAll(/#[0-9a-f]{3,8}\b/gi)].map((m) => m[0].toUpperCase()))].sort()
/** opacity, fill-opacity, stroke-opacity (attributes or CSS), rgba()/hsla() and 4/8-digit hex alpha. */
const OPACITY = /opacity|rgba\(|hsla\(|#(?:[0-9a-f]{4}|[0-9a-f]{8})\b/i

const files = {
  favicon: read('public/favicon.svg'),
  mark: read('design/brand/logo-mark.svg'),
  markDark: read('design/brand/logo-mark-dark.svg'),
  fullBleed: read('design/brand/icon-full-bleed.svg'),
}

describe('brand colours', () => {
  it('uses the agreed values', () => {
    expect([MARK_LIGHT, MARK_DARK, ICON_BG, PREVIEW_BG]).toEqual(['#00293A', '#C4FFFB', '#F5F7F8', '#001A25'])
  })

  it('favicon.svg: #00293A, #C4FFFB under prefers-color-scheme: dark, nothing else', () => {
    expect(hexes(files.favicon)).toEqual([MARK_DARK, MARK_LIGHT].sort())
    expect(files.favicon).toContain(`.m{stroke:${MARK_LIGHT}}`)
    expect(files.favicon).toMatch(new RegExp(`@media \\(prefers-color-scheme:dark\\)\\{\\.m\\{stroke:${MARK_DARK}\\}\\}`))
  })

  it('logo-mark.svg is #00293A only, logo-mark-dark.svg #C4FFFB only', () => {
    expect(hexes(files.mark)).toEqual([MARK_LIGHT])
    expect(hexes(files.markDark)).toEqual([MARK_DARK])
  })

  it('icon-full-bleed.svg: mark #00293A on an opaque #F5F7F8 square', () => {
    expect(hexes(files.fullBleed)).toEqual([MARK_LIGHT, ICON_BG].sort())
    expect(files.fullBleed).toContain(`<rect width="32" height="32" fill="${ICON_BG}"/>`)
  })

  it('no opacity and no background tile in the marks', () => {
    for (const [name, text] of Object.entries(files)) expect(text, name).not.toMatch(OPACITY)
    for (const text of [files.favicon, files.mark, files.markDark]) expect(text).not.toMatch(/<rect|<circle|fill="#/)
  })

  it('tokens.css: --logo-mark is #00293A in light mode and #C4FFFB in dark mode', () => {
    const css = read('src/styles/tokens.css')
    const block = (theme: string) => new RegExp(`:root\\[data-theme="${theme}"\\]\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
    const token = (theme: string, name: string) => new RegExp(`--${name}:\\s*([^;]+);`).exec(block(theme))?.[1].trim()
    expect(token('light', 'logo-mark')).toBe(MARK_LIGHT)
    expect(token('dark', 'logo-mark')).toBe(MARK_DARK)
    // the opaque backgrounds are the page colours
    expect(token('light', 'bg')).toBe(ICON_BG)
    expect(token('dark', 'bg')).toBe(PREVIEW_BG)
    expect([...css.matchAll(/--logo-mark:/g)]).toHaveLength(2)
  })

  it('og-image.html: the dark mark on the dark page colour', () => {
    const html = read('design/brand/og-image.html')
    expect(html).toContain(`background:${PREVIEW_BG}`)
    expect(html).toContain('src="logo-mark-dark.svg"')
  })
})

describe('brand drawing', () => {
  it('favicon.svg and logo-mark.svg contain the path data from brand.ts', () => {
    for (const text of [files.favicon, files.mark, files.markDark, files.fullBleed]) {
      for (const d of LOGO_BRACKETS) expect(text).toContain(`<path d="${d}"/>`)
      expect(text).toContain(`d="${LOGO_HYPERBOLA}"`)
    }
  })

  it('the SVG files are exactly what npm run brand writes', () => {
    expect(files.favicon).toBe(faviconSvg())
    expect(files.mark).toBe(logoMarkSvg(MARK_LIGHT))
    expect(files.markDark).toBe(logoMarkSvg(MARK_DARK))
    expect(files.fullBleed).toBe(iconFullBleedSvg())
  })
})
