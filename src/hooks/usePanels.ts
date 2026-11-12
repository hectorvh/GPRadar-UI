import { useCallback, useEffect, useState } from 'react'

/** Limits and defaults from the mockup. */
export const LEFT = { min: 200, max: 420, def: 260 }
export const RIGHT = { min: 280, max: 520, def: 340 }
export const KEY_STEP = 20

const KEY = 'gpradar-panels'

interface Panels {
  leftOpen: boolean
  rightOpen: boolean
  leftW: number
  rightW: number
}

const DEFAULTS: Panels = { leftOpen: true, rightOpen: true, leftW: LEFT.def, rightW: RIGHT.def }

const clamp = (v: number, lim: { min: number; max: number }) => Math.round(Math.min(lim.max, Math.max(lim.min, v)))

function load(): Panels {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Panels> | null
    if (!raw || typeof raw !== 'object') return DEFAULTS
    return {
      leftOpen: typeof raw.leftOpen === 'boolean' ? raw.leftOpen : DEFAULTS.leftOpen,
      rightOpen: typeof raw.rightOpen === 'boolean' ? raw.rightOpen : DEFAULTS.rightOpen,
      leftW: typeof raw.leftW === 'number' ? clamp(raw.leftW, LEFT) : DEFAULTS.leftW,
      rightW: typeof raw.rightW === 'number' ? clamp(raw.rightW, RIGHT) : DEFAULTS.rightW,
    }
  } catch {
    return DEFAULTS
  }
}

/** Side panel widths and open/closed state, saved in localStorage. */
export function usePanels() {
  const [p, setP] = useState<Panels>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* not persisted */
    }
  }, [p])

  return {
    ...p,
    toggleLeft: useCallback(() => setP((s) => ({ ...s, leftOpen: !s.leftOpen })), []),
    toggleRight: useCallback(() => setP((s) => ({ ...s, rightOpen: !s.rightOpen })), []),
    setLeftW: useCallback((w: number) => setP((s) => ({ ...s, leftW: clamp(w, LEFT) })), []),
    setRightW: useCallback((w: number) => setP((s) => ({ ...s, rightW: clamp(w, RIGHT) })), []),
  }
}
