import { describe, expect, it } from 'vitest'
import { CSV_COLUMNS, csvField, detectionsToCsv, exportFilename } from './csv'
import { det } from './fixtures'

const ctx = {
  mode: 'full' as const,
  revision: '789cfe568390b29f5432fbbddb1a1485970be410',
  threshold: 0.25,
  velocity: 0.1,
  date: new Date('2026-11-12T10:30:00Z'),
}

function parse(csv: string) {
  const lines = csv.split('\r\n').filter(Boolean)
  return {
    comments: lines.filter((l) => l.startsWith('#')),
    header: lines.find((l) => !l.startsWith('#'))!,
    rows: lines.filter((l) => !l.startsWith('#')).slice(1),
  }
}

describe('detectionsToCsv', () => {
  it('writes the spec columns in order', () => {
    const { header } = parse(detectionsToCsv([], ctx))
    expect(header).toBe(
      'id,confidence,x_min,y_min,x_max,y_max,apex_trace,apex_sample,apex_distance_m,apex_twt_ns,apex_depth_m',
    )
    expect(header.split(',')).toEqual([...CSV_COLUMNS])
  })

  it('starts with # lines for mode, model revision, threshold, velocity and date', () => {
    const { comments } = parse(detectionsToCsv([], ctx))
    expect(comments).toContain('# mode: full')
    expect(comments).toContain('# model_revision: 789cfe568390b29f5432fbbddb1a1485970be410')
    expect(comments).toContain('# confidence_threshold: 0.25')
    expect(comments).toContain('# velocity_m_ns: 0.1')
    expect(comments).toContain('# date: 2026-11-12T10:30:00.000Z')
  })

  it('respects the threshold', () => {
    const { rows } = parse(detectionsToCsv([det(1, 0.9), det(2, 0.2), det(3, 0.25)], ctx))
    expect(rows.map((r) => r.split(',')[0])).toEqual(['1', '3'])
  })

  it('writes box_px and apex values', () => {
    const d = det(7, 0.8123, {
      box_px: { x_min: 1.5, y_min: 2, x_max: 30.25, y_max: 44 },
      apex: { trace: 15.9, sample: 2.1, distance_m: 0.318, twt_ns: 0.47, depth_m: 0.0235 },
    })
    const { rows } = parse(detectionsToCsv([d], ctx))
    expect(rows).toEqual(['7,0.8123,1.5,2,30.25,44,15.9,2.1,0.318,0.47,0.0235'])
  })

  it('leaves physical apex fields empty when the API omits them (no metadata)', () => {
    const d = det(1, 0.5, { apex: { trace: 10, sample: 20 } })
    const { rows } = parse(detectionsToCsv([d], ctx))
    expect(rows[0]).toBe('1,0.5,10,5,50,60,10,20,,,')
  })

  it('keeps comment lines on one line even if a server string has a newline', () => {
    const csv = detectionsToCsv([], { ...ctx, revision: 'abc\n=cmd' })
    expect(parse(csv).comments).toContain('# model_revision: abc =cmd')
  })

  it('writes a header with no rows when nothing passes the threshold', () => {
    expect(parse(detectionsToCsv([det(1, 0.1)], ctx)).rows).toEqual([])
  })
})

describe('csvField', () => {
  it('quotes commas, quotes and newlines', () => {
    expect(csvField('a,b')).toBe('"a,b"')
    expect(csvField('say "hi"')).toBe('"say ""hi"""')
    expect(csvField('a\nb')).toBe('"a\nb"')
  })
  it('neutralises spreadsheet formulas in text', () => {
    expect(csvField('=1+1')).toBe("'=1+1")
    expect(csvField('@SUM(A1)')).toBe("'@SUM(A1)")
  })
  it('keeps negative numbers as numbers', () => {
    expect(csvField(-1.5)).toBe('-1.5')
  })
  it('writes null, undefined and NaN as empty', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
    expect(csvField(Number.NaN)).toBe('')
  })
})

describe('exportFilename', () => {
  const date = new Date(2026, 10, 12, 9, 5)
  it('is gpradar_<input>_<date>.csv', () => {
    expect(exportFilename('mendeley_utility_0028.jpg', date, 'csv')).toBe('gpradar_mendeley_utility_0028_2026-11-12.csv')
  })
  it('strips paths and unsafe characters', () => {
    expect(exportFilename('C:\\scans\\my scan (1).out', date, 'png')).toBe('gpradar_my_scan_1_2026-11-12.png')
    expect(exportFilename('../../etc/passwd', date, 'csv')).toBe('gpradar_passwd_2026-11-12.csv')
  })
  it('falls back to "input" when nothing safe remains', () => {
    expect(exportFilename('???.png', date, 'csv')).toBe('gpradar_input_2026-11-12.csv')
  })
})
