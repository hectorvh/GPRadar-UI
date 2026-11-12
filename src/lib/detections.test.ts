import { describe, expect, it } from 'vitest'
import { THRESHOLD_DEFAULT, boxToPercent, filterByThreshold, parseThreshold, shownLabel } from './detections'
import { det } from './fixtures'

describe('threshold filtering', () => {
  const all = [det(1, 0.94), det(2, 0.25), det(3, 0.2499), det(4, 0.05), det(5, 1)]

  it('defaults to 0.25 like the model card', () => {
    expect(THRESHOLD_DEFAULT).toBe(0.25)
  })

  it('keeps detections with confidence >= threshold, in order', () => {
    expect(filterByThreshold(all, 0.25).map((d) => d.id)).toEqual([1, 2, 5])
  })

  it('shows everything the server sent at the minimum (0.05)', () => {
    expect(filterByThreshold(all, 0.05)).toHaveLength(5)
  })

  it('keeps only confidence 1 at the maximum', () => {
    expect(filterByThreshold(all, 1).map((d) => d.id)).toEqual([5])
  })

  it('is not fooled by floating-point slider steps (0.1 + 0.05)', () => {
    const t = 0.1 + 0.05 // 0.15000000000000002
    expect(filterByThreshold([det(1, 0.15)], t)).toHaveLength(1)
  })

  it('does not mutate the input', () => {
    const copy = structuredClone(all)
    filterByThreshold(all, 0.5)
    expect(all).toEqual(copy)
  })

  it('formats the count chip', () => {
    expect(shownLabel(filterByThreshold(all, 0.5).length, all.length)).toBe('2 of 5 shown')
  })
})

describe('parseThreshold', () => {
  it.each([
    ['0.25', 0.25],
    ['0.15000000000000002', 0.15],
    ['0.33', 0.35],
    ['0', 0.05],
    ['1.4', 1],
    ['abc', 0.25],
  ])('%s → %s', (raw, expected) => {
    expect(parseThreshold(raw)).toBe(expected)
  })
})

describe('box_norm → CSS percentages', () => {
  it('maps a box to left/top/width/height', () => {
    expect(boxToPercent({ x_min: 0.1, y_min: 0.2, x_max: 0.35, y_max: 0.6 })).toEqual({
      left: '10%',
      top: '20%',
      width: '25%',
      height: '40%',
    })
  })

  it('covers the whole image for 0–1', () => {
    expect(boxToPercent({ x_min: 0, y_min: 0, x_max: 1, y_max: 1 })).toEqual({ left: '0%', top: '0%', width: '100%', height: '100%' })
  })

  it('avoids floating-point noise in the CSS', () => {
    const p = boxToPercent({ x_min: 0.44838, y_min: 0.35572, x_max: 0.88184, y_max: 0.71144 })
    expect(p).toEqual({ left: '44.838%', top: '35.572%', width: '43.346%', height: '35.572%' })
  })

  it('clamps values outside 0–1 to the image', () => {
    expect(boxToPercent({ x_min: -0.1, y_min: 0.9, x_max: 0.2, y_max: 1.3 })).toEqual({
      left: '0%',
      top: '90%',
      width: '20%',
      height: '10%',
    })
  })

  it('normalises swapped corners', () => {
    expect(boxToPercent({ x_min: 0.5, y_min: 0.5, x_max: 0.25, y_max: 0.25 })).toEqual({
      left: '25%',
      top: '25%',
      width: '25%',
      height: '25%',
    })
  })
})
