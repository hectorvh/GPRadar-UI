#!/usr/bin/env node
/**
 * npm run brand: rebuild the logo files from src/lib/brand.ts.
 *
 * 1. Writes the SVGs: public/favicon.svg, design/brand/logo-mark.svg,
 *    design/brand/logo-mark-dark.svg, design/brand/icon-full-bleed.svg.
 * 2. Renders with Playwright (Chromium):
 *    - public/apple-touch-icon.png (180), public/icon-192.png, public/icon-512.png
 *      from icon-full-bleed.svg (opaque: the OS needs a background);
 *    - public/og-image.png (1200 x 630) from design/brand/og-image.html.
 *
 * Needs Node 22 (imports brand.ts directly) and a Chromium for Playwright:
 * `npx playwright install chromium` once.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { MARK_DARK, MARK_LIGHT, faviconSvg, iconFullBleedSvg, logoMarkSvg } from '../src/lib/brand.ts'

const at = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))

function write(path, text) {
  let old = null
  try {
    old = readFileSync(at(path), 'utf8')
  } catch {
    /* new file */
  }
  if (old === text) return console.log(`  ${path} (unchanged)`)
  writeFileSync(at(path), text)
  console.log(`  ${path} (written)`)
}

console.log('SVG')
write('public/favicon.svg', faviconSvg())
write('design/brand/logo-mark.svg', logoMarkSvg(MARK_LIGHT))
write('design/brand/logo-mark-dark.svg', logoMarkSvg(MARK_DARK))
write('design/brand/icon-full-bleed.svg', iconFullBleedSvg())

console.log('PNG')
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 })

  const icon = iconFullBleedSvg()
  for (const [file, size] of [
    ['public/apple-touch-icon.png', 180],
    ['public/icon-192.png', 192],
    ['public/icon-512.png', 512],
  ]) {
    await page.setViewportSize({ width: size, height: size })
    const svg = icon.replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `)
    await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`)
    await page.screenshot({ path: at(file), clip: { x: 0, y: 0, width: size, height: size } })
    console.log(`  ${file} (${size} x ${size})`)
  }

  // Link preview. og-image.html loads logo-mark-dark.svg next to it; Inter comes from
  // the app's own font package so the result does not depend on installed fonts.
  await page.setViewportSize({ width: 1200, height: 630 })
  await page.goto(pathToFileURL(at('design/brand/og-image.html')).href)
  const inter = pathToFileURL(at('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).href
  await page.addStyleTag({
    content: `@font-face{font-family:"Inter Variable";src:url("${inter}") format("woff2");font-weight:100 900;font-display:block}`,
  })
  await page.evaluate(async () => {
    await Promise.all([document.fonts.load('700 84px "Inter Variable"'), document.fonts.load('400 36px "Inter Variable"')])
    await document.fonts.ready
    await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))))
  })
  await page.screenshot({ path: at('public/og-image.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } })
  console.log('  public/og-image.png (1200 x 630)')
} finally {
  await browser.close()
}
