import type { Theme } from '../hooks/useTheme'
import { EditableTitle } from './EditableTitle'
import { ChevronIcon, InfoIcon, LogoIcon, MoonIcon, PanelLeftIcon, PanelRightIcon } from './icons'

interface Props {
  title: string
  /** Parent project shown before the title as "Project / title" (click opens it). */
  crumb?: { label: string; onClick: () => void } | null
  /** False for titles that are not names (e.g. "New analysis" in a project). */
  editable?: boolean
  /** True when the title is a name the user typed. */
  customTitle: boolean
  onRename: (name: string | null) => void
  renaming: boolean
  onRenamingChange: (v: boolean) => void
  /** Set when the analysis is a saved project: shows the ⌄ options button next to the title. */
  onProjectMenu: ((anchor: HTMLElement) => void) | null
  projectMenuOpen: boolean
  onInfo: () => void
  kindLabel: string
  theme: Theme
  onToggleTheme: () => void
  leftOpen: boolean
  rightOpen: boolean
  /** False when there is no right panel to show (project window, results on screen). */
  rightAvailable?: boolean
  onToggleLeft: () => void
  onToggleRight: () => void
}

export function TopBar({
  title,
  crumb = null,
  editable = true,
  customTitle,
  onRename,
  renaming,
  onRenamingChange,
  onProjectMenu,
  projectMenuOpen,
  onInfo,
  kindLabel,
  theme,
  onToggleTheme,
  leftOpen,
  rightOpen,
  rightAvailable = true,
  onToggleLeft,
  onToggleRight,
}: Props) {
  const dark = theme === 'dark'
  return (
    <header
      className="topbar"
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
        <>
          <button type="button" className="btn ghost icon" aria-label="Show side menu" title="Show side menu" onClick={onToggleLeft}>
            <PanelLeftIcon />
          </button>
          <span
            className="hide-narrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}
            aria-label="GPRadar"
          >
            <LogoIcon size={26} />
            <span aria-hidden="true">GPRadar</span>
          </span>
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
        {crumb && (
          <>
            <button type="button" className="crumb" onClick={crumb.onClick} title={`Open project ${crumb.label}`}>
              {crumb.label}
            </button>
            <span className="crumb-sep" aria-hidden="true">
              /
            </span>
          </>
        )}
        {editable ? (
          <EditableTitle value={title} custom={customTitle} onChange={onRename} editing={renaming} onEditingChange={onRenamingChange} />
        ) : (
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </h1>
        )}
        {onProjectMenu && !renaming && (
          <button
            type="button"
            className="btn ghost icon title-menu"
            aria-label="Project options"
            aria-haspopup="menu"
            aria-expanded={projectMenuOpen}
            title="Project options"
            onClick={(e) => onProjectMenu(e.currentTarget)}
          >
            <ChevronIcon open={projectMenuOpen} />
          </button>
        )}
        <span className="chip hide-narrow">{kindLabel}</span>
      </div>
      <button
        type="button"
        className="btn ghost icon"
        aria-label="About GPRadar"
        aria-haspopup="dialog"
        title="About, licences and data"
        onClick={onInfo}
      >
        <InfoIcon />
      </button>
      <button
        type="button"
        className="btn ghost"
        aria-pressed={dark}
        onClick={onToggleTheme}
        aria-label="Dark mode"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="hide-narrow" style={{ display: 'inline-flex' }}>
          <MoonIcon />
        </span>
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
      {rightAvailable && (
        <button
          type="button"
          className="btn ghost icon"
          aria-label={rightOpen ? 'Hide setup panel' : 'Show setup panel'}
          title={rightOpen ? 'Hide setup panel' : 'Show setup panel'}
          onClick={onToggleRight}
        >
          <PanelRightIcon />
        </button>
      )}
    </header>
  )
}
