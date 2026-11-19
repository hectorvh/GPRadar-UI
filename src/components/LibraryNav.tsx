import { useState, type ReactNode } from 'react'
import type { LibraryState } from '../hooks/useLibrary'
import { analysesOf, independentAnalyses, shortDate, shownCount, splitArchived, type Analysis, type Project } from '../lib/library'
import { AnalysisIcon, ChevronIcon, DotsIcon, PinIcon, ProjectIcon } from './icons'

/** What the side menu is showing as current. */
export interface Current {
  projectId: string | null
  analysisId: string | null
}

interface Common {
  library: LibraryState
  current: Current
  /** "p:<id>" or "a:<id>" being renamed in place. */
  renaming: string | null
  menuOpen: string | null
  onRename: (key: string, name: string | null) => void
  onMenu: (key: string, anchor: HTMLElement) => void
}

function RenameInput({ value, onDone }: { value: string; onDone: (name: string | null) => void }) {
  const [v, setV] = useState(value)
  return (
    <input
      className="proj-rename"
      aria-label="New name"
      autoFocus
      maxLength={80}
      value={v}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onDone(v.trim() || null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onDone(v.trim() || null)
        if (e.key === 'Escape') onDone(null)
      }}
    />
  )
}

interface RowProps {
  k: string
  name: string
  meta: string
  icon: ReactNode
  pinned: boolean
  on: boolean
  nested?: boolean
  onOpen: () => void
  common: Common
}

function Row({ k, name, meta, icon, pinned, on, nested, onOpen, common }: RowProps) {
  return (
    <li className={'proj-row' + (on ? ' on' : '') + (common.menuOpen === k ? ' menu-open' : '') + (nested ? ' nested' : '')}>
      {common.renaming === k ? (
        <RenameInput value={name} onDone={(n) => common.onRename(k, n)} />
      ) : (
        <button type="button" className="proj-open" aria-current={on ? 'true' : undefined} onClick={onOpen}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {icon}
            {pinned && (
              <span className="pin-mark" aria-label="Pinned">
                <PinIcon />
              </span>
            )}
            <span className="proj-name">{name}</span>
          </span>
          <span className="proj-meta">{meta}</span>
        </button>
      )}
      <button
        type="button"
        className="proj-dots"
        aria-label={`Options for ${name}`}
        aria-haspopup="menu"
        aria-expanded={common.menuOpen === k}
        onClick={(e) => common.onMenu(k, e.currentTarget)}
      >
        <DotsIcon />
      </button>
    </li>
  )
}

const analysisMeta = (a: Analysis) => {
  const n = shownCount(a)
  return `${shortDate(a.updatedAt)} · ${n} detection${n === 1 ? '' : 's'}`
}

function ArchivedToggle({ n, open, onToggle }: { n: number; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="linkbtn"
      style={{ padding: '2px 10px', color: 'var(--muted)' }}
      aria-expanded={open}
      onClick={onToggle}
    >
      Archived ({n}) <ChevronIcon open={open} />
    </button>
  )
}

/** "Projects": collections of analyses. The open project lists its analyses underneath. */
export function ProjectsNav(p: Common & { onOpenProject: (id: string) => void; onOpenAnalysis: (id: string) => void }) {
  const [showArchived, setShowArchived] = useState(false)
  if (p.library.status === 'loading') return <span className="skeleton" style={{ height: 40, margin: '0 4px' }} aria-hidden="true" />
  const { analyses } = p.library
  const { active, archived } = splitArchived(p.library.projects)

  const row = (pr: Project) => {
    const inside = analysesOf(analyses, pr.id)
    const expanded = p.current.projectId === pr.id
    return (
      <div key={pr.id}>
        <Row
          k={`p:${pr.id}`}
          name={pr.name}
          meta={`${inside.length} B-scan${inside.length === 1 ? '' : 's'} · ${shortDate(pr.updatedAt)}`}
          icon={<ProjectIcon />}
          pinned={pr.pinned}
          on={expanded && !p.current.analysisId}
          onOpen={() => p.onOpenProject(pr.id)}
          common={p}
        />
        {expanded && inside.length > 0 && (
          <ul className="proj-list" aria-label={`Analyses in ${pr.name}`}>
            {inside.map((a) => (
              <Row
                key={a.id}
                k={`a:${a.id}`}
                name={a.name}
                meta={analysisMeta(a)}
                icon={<AnalysisIcon />}
                pinned={a.pinned}
                on={p.current.analysisId === a.id}
                nested
                onOpen={() => p.onOpenAnalysis(a.id)}
                common={p}
              />
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {active.length === 0 && (
        <p style={{ margin: 0, padding: '2px 10px', fontSize: 13, color: 'var(--muted)' }}>
          No projects yet. Use <b>New project</b> to group several B-scans
        </p>
      )}
      {active.length > 0 && <ul className="proj-list">{active.map(row)}</ul>}
      {archived.length > 0 && (
        <>
          <ArchivedToggle n={archived.length} open={showArchived} onToggle={() => setShowArchived((s) => !s)} />
          {showArchived && <ul className="proj-list archived">{archived.map(row)}</ul>}
        </>
      )}
    </div>
  )
}

/** "Analyses": single B-scan analyses that belong to no project. */
export function AnalysesNav(p: Common & { onOpenAnalysis: (id: string) => void; onSignIn: () => void }) {
  const [showArchived, setShowArchived] = useState(false)
  if (p.library.status === 'loading') return <span className="skeleton" style={{ height: 40, margin: '0 4px' }} aria-hidden="true" />
  const { active, archived } = splitArchived(independentAnalyses(p.library.analyses, p.library.projects))

  const row = (a: Analysis) => (
    <Row
      key={a.id}
      k={`a:${a.id}`}
      name={a.name}
      meta={analysisMeta(a)}
      icon={<AnalysisIcon />}
      pinned={a.pinned}
      on={p.current.analysisId === a.id}
      onOpen={() => p.onOpenAnalysis(a.id)}
      common={p}
    />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {active.length === 0 && (
        <p style={{ margin: 0, padding: '2px 10px', fontSize: 13, color: 'var(--muted)' }}>
          A single B-scan you run from Home appears here
        </p>
      )}
      {active.length > 0 && <ul className="proj-list">{active.map(row)}</ul>}
      {archived.length > 0 && (
        <>
          <ArchivedToggle n={archived.length} open={showArchived} onToggle={() => setShowArchived((s) => !s)} />
          {showArchived && <ul className="proj-list archived">{archived.map(row)}</ul>}
        </>
      )}
      <p style={{ margin: 0, padding: '2px 10px', fontSize: 11, color: 'var(--muted)' }}>
        Projects and analyses are saved in this browser.{' '}
        <button type="button" className="linkbtn" style={{ fontSize: 11 }} onClick={p.onSignIn}>
          Sign in
        </button>{' '}
        to keep them across devices
      </p>
    </div>
  )
}
