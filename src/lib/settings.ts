import type { Mode } from './types'

/** User preferences from the Settings dialog, kept in localStorage. */
export interface Settings {
  /** Show the bundled samples (side menu and first screen). */
  showSamples: boolean
  /** Which processing modes are offered. At least one is always on. */
  modes: Record<Mode, boolean>
}

export const DEFAULT_SETTINGS: Settings = { showSamples: true, modes: { full: true, detector: true } }

export const SETTINGS_KEY = 'gpradar-settings'

/** Fill missing or invalid fields from the defaults; never leave both modes off. */
export function normalizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Settings>
  const m = (r.modes && typeof r.modes === 'object' ? r.modes : {}) as Partial<Record<Mode, unknown>>
  const modes = {
    full: typeof m.full === 'boolean' ? m.full : DEFAULT_SETTINGS.modes.full,
    detector: typeof m.detector === 'boolean' ? m.detector : DEFAULT_SETTINGS.modes.detector,
  }
  if (!modes.full && !modes.detector) modes.full = modes.detector = true
  return { showSamples: typeof r.showSamples === 'boolean' ? r.showSamples : DEFAULT_SETTINGS.showSamples, modes }
}

/** The mode to use: the preferred one if it is on, otherwise the one that is on. */
export function allowedMode(preferred: Mode, s: Settings): Mode {
  if (s.modes[preferred]) return preferred
  return preferred === 'full' ? 'detector' : 'full'
}

/** Turn a mode on or off; turning off the last mode that is on is ignored. */
export function toggleMode(s: Settings, mode: Mode): Settings {
  const next = { ...s.modes, [mode]: !s.modes[mode] }
  if (!next.full && !next.detector) return s
  return { ...s, modes: next }
}
