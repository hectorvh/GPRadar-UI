import type { Theme } from '../hooks/useTheme'
import { LINKS } from '../lib/links'
import { InfoIcon, MoonIcon, PanelLeftIcon, PanelRightIcon } from './icons'

interface Props {
  title: string
  kindLabel: string
  theme: Theme
  onToggleTheme: () => void
  leftOpen: boolean
  rightOpen: boolean
  onToggleLeft: () => void
  onToggleRight: () => void
}

export function TopBar({ title, kindLabel, theme, onToggleTheme, leftOpen, rightOpen, onToggleLeft, onToggleRight }: Props) {
  const dark = theme === 'dark'
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        minHeight: 60,
        padding: '10px 20px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {!leftOpen && (
        <button type="button" className="btn ghost icon" aria-label="Show project menu" onClick={onToggleLeft}>
          <PanelLeftIcon />
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
        <span className="chip">{kindLabel}</span>
      </div>
      <a
        className="btn ghost icon"
        href={LINKS.readme}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="About GPRadar (README)"
        title="About · README"
      >
        <InfoIcon />
      </a>
      <button type="button" className="btn ghost" aria-pressed={dark} onClick={onToggleTheme} aria-label="Dark mode">
        <MoonIcon />
        <span
          style={{
            display: 'inline-flex',
            width: 34,
            height: 20,
            borderRadius: 999,
            background: 'var(--border)',
            padding: 2,
            justifyContent: dark ? 'flex-end' : 'flex-start',
          }}
        >
          <span style={{ width: 16, height: 16, borderRadius: 999, background: 'var(--accent)' }} />
        </span>
      </button>
      <button type="button" className="btn ghost icon" aria-label={rightOpen ? 'Hide input panel' : 'Show input panel'} onClick={onToggleRight}>
        <PanelRightIcon />
      </button>
    </header>
  )
}
