/** Inline SVG icons from the mockup (decorative: aria-hidden). */
import type { CSSProperties } from 'react'

const line = (width: number, stroke = 'currentColor', extra: CSSProperties = {}): CSSProperties => ({
  fill: 'none',
  stroke,
  strokeWidth: `${width}px`,
  ...extra,
})

export const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" style={line(2, 'var(--accent)', { strokeLinecap: 'round' })}>
    <path d="M3 20 Q13 2 23 20" />
    <path d="M7 20 Q13 9 19 20" />
    <path d="M11 20 Q13 16 15 20" />
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

export const SampleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'var(--muted)', { flex: '0 0 auto' })}>
    <path d="M3 17 Q12 3 21 17" />
    <path d="M3 21h18" />
  </svg>
)

export const WarnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8, 'var(--accent)', { flex: '0 0 auto', marginTop: 1 })}>
    <path d="M12 3 2 20h20L12 3z" />
    <path d="M12 10v4M12 17v.5" />
  </svg>
)

export const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
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

export const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={line(1.8)}>
    <path d="M12 16V5M7 10l5-5 5 5M5 19h14" />
  </svg>
)
