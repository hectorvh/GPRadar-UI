/** Inline SVG icons from the mockup (decorative: aria-hidden). */
import type { CSSProperties } from 'react'
import {
  LOGO_BRACKETS,
  LOGO_HYPERBOLA,
  LOGO_HYP_STROKE,
  LOGO_STROKE,
  LOGO_VIEWBOX,
  MINI_ANALYSIS_BRACKETS,
  MINI_PROJECT_BRACKETS,
  MINI_PROJECT_FRAME,
  MINI_PROJECT_HYPERBOLA,
  MINI_SAMPLE_HYPERBOLA,
  MINI_STROKE,
} from '../lib/brand'

const line = (width: number, stroke = 'currentColor', extra: CSSProperties = {}): CSSProperties => ({
  fill: 'none',
  stroke,
  strokeWidth: `${width}px`,
  ...extra,
})

/** Brand mark (logo option E): viewfinder brackets around a radar hyperbola, no background.
 *  One colour that follows the theme (--logo-mark: dark in light mode, light in dark mode).
 *  Path data from src/lib/brand.ts, like public/favicon.svg and design/brand/. */
export const LogoIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox={LOGO_VIEWBOX} aria-hidden="true" style={{ flex: '0 0 auto', display: 'block' }}>
    <g fill="none" stroke="var(--logo-mark)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={LOGO_STROKE}>
      {LOGO_BRACKETS.map((d) => (
        <path key={d} d={d} />
      ))}
      <path d={LOGO_HYPERBOLA} strokeWidth={LOGO_HYP_STROKE} />
    </g>
  </svg>
)

const mini = (color = 'var(--muted)') =>
  ({ fill: 'none', stroke: color, strokeWidth: MINI_STROKE, strokeLinecap: 'round', strokeLinejoin: 'round', flex: '0 0 auto' }) as const

/** Mini icon: one analysis (one B-scan) = the logo's brackets and hyperbola, plus the detected apex. */
export const AnalysisIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={mini()}>
    <path d={MINI_ANALYSIS_BRACKETS} />
    <path d={LOGO_HYPERBOLA} />
    <circle cx="16" cy="12" r="2.4" fill="var(--muted)" stroke="none" />
  </svg>
)

/** Mini icon: a project = several analyses stacked (a frame behind the logo mark). */
export const ProjectIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={mini()}>
    <path d={MINI_PROJECT_FRAME} />
    <path d={MINI_PROJECT_BRACKETS} />
    <path d={MINI_PROJECT_HYPERBOLA} />
  </svg>
)

/** Mini icon: a bundled sample (a scan in a frame); dashed hyperbola = simulated with gprMax. */
export const SampleIcon = ({ size = 16, simulated = false }: { size?: number; simulated?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={mini()}>
    <rect x="4" y="5" width="24" height="22" rx="4" />
    <path d={MINI_SAMPLE_HYPERBOLA} strokeDasharray={simulated ? '3 3.2' : undefined} />
  </svg>
)

export const GithubIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" style={{ fill: 'currentColor' }}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
)

export const PanelLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </svg>
)

export const PanelRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M15 4v16" />
  </svg>
)

export const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(2)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const WarnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'var(--accent)', { flex: '0 0 auto', marginTop: 1 })}>
    <path d="M12 3 2 20h20L12 3z" />
    <path d="M12 10v4M12 17v.5" />
  </svg>
)

export const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </svg>
)

export const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
)

export const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'currentColor', { strokeLinecap: 'round' })}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
)

/** Opens the side menu drawer (phones and tablets). */
export const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'currentColor', { strokeLinecap: 'round' })}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
)

export const UploadIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <path d="M12 16V5M7 10l5-5 5 5M5 19h14" />
  </svg>
)

export const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={line(2, 'currentColor', { flex: '0 0 auto', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' })}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const PencilIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="pencil"
    style={line(2, 'currentColor', { flex: '0 0 auto' })}
  >
    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  </svg>
)

export const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={line(2)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
)

export const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

export const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'currentColor', flex: '0 0 auto' }}>
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
)

export const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'currentColor', { flex: '0 0 auto' })}>
    <path d="M9 4h6l-1 6 4 3v2H6v-2l4-3-1-6zM12 15v6" />
  </svg>
)

export const ArchiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'currentColor', { flex: '0 0 auto' })}>
    <rect x="3" y="4" width="18" height="5" rx="1" />
    <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" />
  </svg>
)

export const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'currentColor', { flex: '0 0 auto' })}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
)

export const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'currentColor', { flex: '0 0 auto' })}>
    <path d="M12 15V4M7 9l5-5 5 5M5 14v5h14v-5" />
  </svg>
)

export const MoveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'currentColor', { flex: '0 0 auto' })}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM10 13h6M13 10l3 3-3 3" />
  </svg>
)

export const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'currentColor', flex: '0 0 auto' }}>
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
)
