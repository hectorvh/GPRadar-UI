import { useSyncExternalStore } from 'react'
import { MEDIA, type Breakpoint } from '../lib/breakpoints'

const hasMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

function read(): Breakpoint {
  if (!hasMatchMedia()) return 'desktop'
  if (window.matchMedia(MEDIA.phone).matches) return 'phone'
  if (window.matchMedia(MEDIA.desktop).matches) return 'desktop'
  return 'tablet'
}

function subscribe(onChange: () => void): () => void {
  if (!hasMatchMedia()) return () => {}
  const lists = [window.matchMedia(MEDIA.phone), window.matchMedia(MEDIA.desktop)]
  for (const l of lists) l.addEventListener('change', onChange)
  return () => {
    for (const l of lists) l.removeEventListener('change', onChange)
  }
}

/**
 * Current layout breakpoint from matchMedia, updated when the window crosses
 * one. Without a window (server rendering, tests in node) it is 'desktop'.
 * Use CSS for layout; this is for the few places that render different markup.
 */
export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, read, () => 'desktop')
}
