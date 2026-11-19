/**
 * Layout breakpoints, the one place they are defined.
 *
 * Browsers do not support CSS custom media (@custom-media) yet, so
 * src/styles/base.css repeats these values in its @media rules;
 * breakpoints.test.ts fails if it uses any other width.
 *
 *   phone    ≤ 640 px   top bar, drawer, bottom sheet, action bar, cards
 *   tablet   641–1024   drawer for the side menu, setup panel as a 320 px column
 *   desktop  ≥ 1025 px  resizable side menu and setup panel (unchanged)
 */
export type Breakpoint = 'phone' | 'tablet' | 'desktop'

export const PHONE_MAX = 640
export const DESKTOP_MIN = 1025
/** Width of the setup panel on tablets (no resize handle). */
export const TABLET_PANEL_W = 320

export const MEDIA = {
  phone: `(max-width: ${PHONE_MAX}px)`,
  desktop: `(min-width: ${DESKTOP_MIN}px)`,
} as const

/** Breakpoint for a viewport width in CSS px. */
export function breakpointFor(width: number): Breakpoint {
  if (width <= PHONE_MAX) return 'phone'
  if (width >= DESKTOP_MIN) return 'desktop'
  return 'tablet'
}
