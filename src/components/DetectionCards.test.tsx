// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { filterByThreshold } from '../lib/detections'
import { det } from '../lib/fixtures'
import type { Detection } from '../lib/types'
import { DetectionCards } from './DetectionCards'
import { DetectionsTable } from './DetectionsTable'

const noop = () => {}

const all: Detection[] = [
  det(1, 0.91),
  det(2, 0.4, { apex: { trace: 80, sample: 40, distance_m: 1.234, twt_ns: 12.34, depth_m: null } }),
  det(3, 0.25),
  det(4, 0.12, { apex: { trace: 5, sample: 7, distance_m: null, twt_ns: null, depth_m: null } }),
]

const dom = (html: string) => new DOMParser().parseFromString(html, 'text/html')

function table(shown: Detection[], threshold: number, total: number | null = all.length) {
  const doc = dom(
    renderToStaticMarkup(
      <DetectionsTable shown={shown} total={total} selectedId={null} scrollToId={null} onSelect={noop} onCsv={noop} onPng={noop} exporting={false} threshold={threshold} />,
    ),
  )
  const rows = [...doc.querySelectorAll('tbody tr')].map((tr) => {
    const td = [...tr.querySelectorAll('td')].map((c) => c.textContent?.trim())
    return { id: td[0], conf: tr.querySelector('[data-field="conf"]')?.textContent, distance: td[2], twt: td[3], depth: td[4] }
  })
  return { rows, text: doc.body.textContent ?? '' }
}

function cards(shown: Detection[], threshold: number, total: number | null = all.length, selectedId: number | null = null) {
  const doc = dom(
    renderToStaticMarkup(<DetectionCards shown={shown} total={total} selectedId={selectedId} scrollToId={null} onSelect={noop} threshold={threshold} />),
  )
  const rows = [...doc.querySelectorAll('.det-cards li')].map((li) => ({
    id: li.querySelector('.det-card-id')?.textContent,
    conf: li.querySelector('[data-field="conf"]')?.textContent,
    distance: li.querySelector('[data-field="distance"]')?.textContent,
    twt: li.querySelector('[data-field="twt"]')?.textContent,
    depth: li.querySelector('[data-field="depth"]')?.textContent,
  }))
  return { rows, doc, text: doc.body.textContent ?? '' }
}

describe('DetectionCards', () => {
  it('shows the same ids and values as the table', () => {
    const shown = filterByThreshold(all, 0.05)
    expect(cards(shown, 0.05).rows).toEqual(table(shown, 0.05).rows)
    expect(cards(shown, 0.05).rows.map((r) => r.id)).toEqual(['#1', '#2', '#3', '#4'])
  })

  it('formats distance, TWT and depth like the table, with dashes for missing values', () => {
    const { rows } = cards(all, 0.05)
    expect(rows[1]).toEqual({ id: '#2', conf: '0.40', distance: '1.23', twt: '12.3', depth: '—' })
    expect(rows[0].depth).toBe('≈ 0.06')
    expect(rows[3]).toMatchObject({ distance: '—', twt: '—', depth: '—' })
  })

  it('respects the threshold: only detections at or above it, as in the table', () => {
    for (const t of [0.25, 0.5, 0.95]) {
      const shown = filterByThreshold(all, t)
      const c = cards(shown, t)
      expect(c.rows).toEqual(table(shown, t).rows)
      expect(c.text).toContain(`${shown.length} of ${all.length} shown`)
    }
    expect(cards(filterByThreshold(all, 0.25), 0.25).rows.map((r) => r.id)).toEqual(['#1', '#2', '#3'])
  })

  it('keeps the filtered-out and empty messages', () => {
    const above = cards(filterByThreshold(all, 0.95), 0.95)
    expect(above.rows).toHaveLength(0)
    expect(above.text).toContain('No detections above 0.95 confidence')
    expect(cards([], 0.25, 0).text).toContain('No hyperbolas detected in this scan')
    expect(cards([], 0.25, null).text).toContain('Run a sample or upload a B-scan to see detections')
  })

  it('marks the selected detection', () => {
    const { doc } = cards(all, 0.05, all.length, 2)
    const pressed = [...doc.querySelectorAll('button[aria-pressed="true"]')]
    expect(pressed).toHaveLength(1)
    expect(pressed[0].closest('li')?.id).toBe('det-card-2')
  })
})
