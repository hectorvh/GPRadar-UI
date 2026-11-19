import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, allowedMode, normalizeSettings, toggleMode } from './settings'

describe('normalizeSettings', () => {
  it('falls back to the defaults for junk', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings({ showSamples: 'yes', modes: 3 })).toEqual(DEFAULT_SETTINGS)
  })
  it('keeps valid values', () => {
    expect(normalizeSettings({ showSamples: false, modes: { full: false, detector: true } })).toEqual({
      showSamples: false,
      modes: { full: false, detector: true },
    })
  })
  it('never stores both modes off', () => {
    expect(normalizeSettings({ modes: { full: false, detector: false } }).modes).toEqual({ full: true, detector: true })
  })
})

describe('allowedMode', () => {
  const onlyDetector = { ...DEFAULT_SETTINGS, modes: { full: false, detector: true } }
  it('keeps the preferred mode when it is on', () => {
    expect(allowedMode('full', DEFAULT_SETTINGS)).toBe('full')
  })
  it('switches to the mode that is on', () => {
    expect(allowedMode('full', onlyDetector)).toBe('detector')
  })
})

describe('toggleMode', () => {
  it('turns a mode off', () => {
    expect(toggleMode(DEFAULT_SETTINGS, 'full').modes).toEqual({ full: false, detector: true })
  })
  it('refuses to turn off the last mode', () => {
    const one = toggleMode(DEFAULT_SETTINGS, 'full')
    expect(toggleMode(one, 'detector')).toBe(one)
  })
})
