import { useCallback, useEffect, useState } from 'react'
import { SETTINGS_KEY, normalizeSettings, type Settings } from '../lib/settings'

function load(): Settings {
  try {
    return normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null'))
  } catch {
    return normalizeSettings(null)
  }
}

/** Settings dialog values, saved in this browser. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load)

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      /* not persisted */
    }
  }, [settings])

  const update = useCallback((s: Settings) => setSettings(normalizeSettings(s)), [])
  return { settings, update }
}
