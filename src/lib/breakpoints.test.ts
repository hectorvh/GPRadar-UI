/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DESKTOP_MIN, MEDIA, PHONE_MAX, breakpointFor } from './breakpoints'

describe('breakpoints', () => {
  it('maps widths to phone, tablet and desktop', () => {
    expect([320, 390, 640].map(breakpointFor)).toEqual(['phone', 'phone', 'phone'])
    expect([641, 768, 1024].map(breakpointFor)).toEqual(['tablet', 'tablet', 'tablet'])
    expect([1025, 1440].map(breakpointFor)).toEqual(['desktop', 'desktop'])
  })

  it('builds the media queries from the same numbers', () => {
    expect(MEDIA.phone).toBe(`(max-width: ${PHONE_MAX}px)`)
    expect(MEDIA.desktop).toBe(`(min-width: ${DESKTOP_MIN}px)`)
  })

  it('base.css uses no other layout widths', () => {
    const css = readFileSync(new URL('../styles/base.css', import.meta.url), 'utf8')
    const widths = [...css.matchAll(/@media[^{]*\((?:max|min)-width:\s*(\d+)px\)/g)].map((m) => Number(m[1]))
    expect(widths.length).toBeGreaterThan(0)
    for (const w of widths) expect([PHONE_MAX, PHONE_MAX + 1, DESKTOP_MIN - 1, DESKTOP_MIN]).toContain(w)
  })
})
