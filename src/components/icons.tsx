/** Inline SVG icons from the mockup (decorative: aria-hidden). */
import type { CSSProperties } from 'react'

const line = (width: number, stroke = 'currentColor', extra: CSSProperties = {}): CSSProperties => ({
  fill: 'none',
  stroke,
  strokeWidth: `${width}px`,
  ...extra,
})

/** Hyperbola paths shared by the logo and the mini icons (32 x 32 grid). */
const HYP =
  'M8.00 22.35 L8.67 21.14 L9.33 19.95 L10.00 18.79 L10.67 17.67 L11.33 16.59 L12.00 15.56 L12.67 14.61 L13.33 13.76 L14.00 13.04 L14.67 12.48 L15.33 12.12 L16.00 12.00 L16.67 12.12 L17.33 12.48 L18.00 13.04 L18.67 13.76 L19.33 14.61 L20.00 15.56 L20.67 16.59 L21.33 17.67 L22.00 18.79 L22.67 19.95 L23.33 21.14 L24.00 22.35'
const HYP_PROJECT =
  'M6.50 23.55 L7.15 22.37 L7.80 21.21 L8.45 20.09 L9.10 19.00 L9.75 17.98 L10.40 17.04 L11.05 16.22 L11.70 15.57 L12.35 15.15 L13.00 15.00 L13.65 15.15 L14.30 15.57 L14.95 16.22 L15.60 17.04 L16.25 17.98 L16.90 19.00 L17.55 20.09 L18.20 21.21 L18.85 22.37 L19.50 23.55'
const HYP_SAMPLE =
  'M9.00 20.59 L9.58 19.68 L10.17 18.79 L10.75 17.92 L11.33 17.08 L11.92 16.28 L12.50 15.53 L13.08 14.84 L13.67 14.23 L14.25 13.72 L14.83 13.33 L15.42 13.08 L16.00 13.00 L16.58 13.08 L17.17 13.33 L17.75 13.72 L18.33 14.23 L18.92 14.84 L19.50 15.53 L20.08 16.28 L20.67 17.08 L21.25 17.92 L21.83 18.79 L22.42 19.68 L23.00 20.59'

/** Brand mark (logo option E): viewfinder brackets around a radar hyperbola, no background.
 *  One colour that follows the theme (--logo-mark: dark in light mode, light in dark mode).
 *  Same drawing as public/favicon.svg; source design/brand/logo-mark.svg. */
export const LogoIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="3.5 3.5 25 25" aria-hidden="true" style={{ flex: '0 0 auto', display: 'block' }}>
    <g fill="none" stroke="var(--logo-mark)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M5 10V5h5" />
      <path d="M22 5h5v5" />
      <path d="M27 22v5h-5" />
      <path d="M10 27H5v-5" />
      <path d={HYP} strokeWidth="2.4" />
    </g>
  </svg>
)

const mini = (color = 'var(--muted)') =>
  ({ fill: 'none', stroke: color, strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round', flex: '0 0 auto' }) as const

/** Mini icon: one analysis (one B-scan) = the logo's brackets and hyperbola, plus the detected apex. */
export const AnalysisIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={mini()}>
    <path d="M5 11V5h6M21 5h6v6M27 21v6h-6M11 27H5v-6" />
    <path d={HYP} />
    <circle cx="16" cy="12" r="2.4" fill="var(--muted)" stroke="none" />
  </svg>
)

/** Mini icon: a project = several analyses stacked (a frame behind the logo mark). */
export const ProjectIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={mini()}>
    <path d="M10 3h17a2 2 0 0 1 2 2v17" />
    <path d="M3 12V8h4M19 8h4v4M23 25v4h-4M7 29H3v-4" />
    <path d={HYP_PROJECT} />
  </svg>
)

/** Mini icon: a bundled sample (a scan in a frame); dashed hyperbola = simulated with gprMax. */
export const SampleIcon = ({ size = 16, simulated = false }: { size?: number; simulated?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={mini()}>
    <rect x="4" y="5" width="24" height="22" rx="4" />
    <path d={HYP_SAMPLE} strokeDasharray={simulated ? '3 3.2' : undefined} />
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
