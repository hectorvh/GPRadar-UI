import { useEffect, useState, type ReactNode } from 'react'
import type { SamplesState } from '../hooks/useBackend'
import { LINKS } from '../lib/links'
import { sampleKindLabel, shortCitation } from '../lib/source'
import type { Sample } from '../lib/types'
import { ChevronIcon, CloseIcon, GearIcon, GithubIcon, LogoIcon, PanelLeftIcon, PlusIcon, SampleIcon, UserIcon, WarnIcon } from './icons'

interface Props {
  /** 'column': resizable column (desktop). 'drawer': inside the side-menu drawer (phones, tablets). */
  variant?: 'column' | 'drawer'
  /** Column width; not used in the drawer. */
  width?: number
  samples: SamplesState
  activeSampleId: string | null
  onPickSample: (s: Sample) => void
  onNewAnalysis: () => void
  onNewProject: () => void
  onHide: () => void
  onSignIn: () => void
  onSettings: () => void
  /** Settings → View samples. */
  showSamples: boolean
  /** Lists built by App (LibraryNav). */
  projectsNav: ReactNode
  analysesNav: ReactNode
  /** Logo click: back to the home screen. */
  onHome: () => void
}

/** Show the search box only when the list is long enough to need it. */
const SEARCH_FROM = 6
const SECTIONS_KEY = 'gpradar-nav-sections'

type SectionId = 'samples' | 'projects' | 'analyses'

function loadSections(): Record<SectionId, boolean> {
  const def = { samples: true, projects: true, analyses: true }
  try {
    const raw = JSON.parse(localStorage.getItem(SECTIONS_KEY) ?? 'null') as Partial<Record<SectionId, unknown>> | null
    return {
      samples: typeof raw?.samples === 'boolean' ? raw.samples : def.samples,
      projects: typeof raw?.projects === 'boolean' ? raw.projects : def.projects,
      analyses: typeof raw?.analyses === 'boolean' ? raw.analyses : def.analyses,
    }
  } catch {
    return def
  }
}

const muted = { margin: 0, padding: '0 10px', fontSize: 13, color: 'var(--muted)' } as const

/** Collapsible section: the heading is a button that opens or hides the list. */
function Section({
  id,
  title,
  open,
  onToggle,
  count,
  action,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  count?: number
  /** Small button at the right end of the heading (e.g. + New project). */
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className="sec-head">
        <button type="button" className="sec-toggle" aria-expanded={open} aria-controls={`sec-${id}`} onClick={onToggle}>
          <span className="sec-title">{title}</span>
          {count != null && <span className="sec-count">{count}</span>}
          <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
            <ChevronIcon open={open} />
          </span>
        </button>
        {action}
      </div>
      {open && (
        <div id={`sec-${id}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {children}
        </div>
      )}
    </div>
  )
}

export function LeftNav({
  variant = 'column',
  width,
  samples,
  activeSampleId,
  onPickSample,
  onNewAnalysis,
  onNewProject,
  onHide,
  onSignIn,
  onSettings,
  showSamples,
  projectsNav,
  analysesNav,
  onHome,
}: Props) {
  const [query, setQuery] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [open, setOpen] = useState(loadSections)
  const q = query.trim().toLowerCase()
  const all = samples.status === 'ok' ? samples.samples : []
  const list = all.filter((s) => !q || `${s.name} ${s.description} ${s.citation}`.toLowerCase().includes(q))

  useEffect(() => {
    try {
      localStorage.setItem(SECTIONS_KEY, JSON.stringify(open))
    } catch {
      /* not persisted */
    }
  }, [open])

  const toggle = (id: SectionId) => () => setOpen((o) => ({ ...o, [id]: !o[id] }))
  const drawer = variant === 'drawer'

  return (
    <nav
      className={'panel scroll leftnav' + (drawer ? ' in-drawer' : '')}
      aria-label="Samples and projects"
      style={{
        width: drawer ? '100%' : width,
        flex: '0 0 auto',
        minHeight: drawer ? '100%' : 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '14px 12px',
        borderRight: drawer ? 0 : '1px solid var(--border)',
        background: 'var(--nav)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, paddingLeft: 2 }}>
          <button type="button" className="home-btn" onClick={onHome} title="Home" aria-label="GPRadar home">
            <LogoIcon size={32} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
            <button type="button" className="home-btn brand-name" onClick={onHome} tabIndex={-1} aria-hidden="true">
              GPRadar
            </button>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="quiet-link" style={{ fontSize: 12 }}>
              by <GithubIcon /> hectorvh
            </a>
          </div>
        </div>
        {drawer ? (
          <button type="button" className="btn ghost icon" aria-label="Close menu" title="Close menu" onClick={onHide}>
            <CloseIcon />
          </button>
        ) : (
          <button type="button" className="btn ghost icon" aria-label="Hide side menu" title="Hide side menu" onClick={onHide}>
            <PanelLeftIcon />
          </button>
        )}
      </div>

      <button type="button" className="btn" style={{ justifyContent: 'flex-start' }} onClick={onNewAnalysis}>
        <PlusIcon />
        New analysis
      </button>

      {showSamples && all.length >= SEARCH_FROM && (
        <div className="field">
          <label htmlFor="psearch" className="sr">
            Search samples
          </label>
          <input id="psearch" type="search" placeholder="Search samples" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {showSamples && (
          <Section
            id="samples"
            title="Samples"
            open={open.samples}
            onToggle={toggle('samples')}
            count={samples.status === 'ok' ? all.length : undefined}
          >
            {samples.status === 'loading' && (
              <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 4px' }}>
                <span className="sr">Loading samples…</span>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="skeleton" style={{ height: 44 }} />
                ))}
              </div>
            )}
            {samples.status === 'error' && <p style={muted}>Samples are unavailable right now</p>}
            {samples.status === 'ok' && list.length === 0 && <p style={muted}>No samples match</p>}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {list.map((s) => {
                const on = s.id === activeSampleId
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={'proj sample' + (on ? ' on' : '')}
                      aria-current={on ? 'true' : undefined}
                      aria-describedby={`cite-${s.id}`}
                      title={s.description}
                      onClick={() => onPickSample(s)}
                    >
                      <SampleIcon simulated={s.kind !== 'image'} />
                      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 1 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>{sampleKindLabel(s.kind)}</span>
                      </span>
                    </button>
                    <p className="cite" id={`cite-${s.id}`} title={s.citation}>
                      {shortCitation(s.citation)}
                    </p>
                  </li>
                )
              })}
            </ul>
          </Section>
        )}

        <Section
          id="projects"
          title="Projects"
          open={open.projects}
          onToggle={toggle('projects')}
          action={
            <button type="button" className="sec-action" aria-label="New project" title="New project" onClick={onNewProject}>
              <PlusIcon />
            </button>
          }
        >
          {projectsNav}
        </Section>
        <Section id="analyses" title="Analyses" open={open.analyses} onToggle={toggle('analyses')}>
          {analysesNav}
        </Section>
      </div>

      <aside role="note" className="note" style={{ flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <WarnIcon />
          <p style={{ margin: 0 }}>
            <strong>Research prototype.</strong> Detections can be missed or wrong. In tests it found about 90% of buried utilities and 50%
            of voids*
          </p>
        </div>
        <button
          type="button"
          className="linkbtn"
          aria-expanded={moreOpen}
          aria-controls="limits-more"
          onClick={() => setMoreOpen((o) => !o)}
          style={{ alignSelf: 'flex-start', marginLeft: 26 }}
        >
          {moreOpen ? 'Less' : 'Limitations'} <ChevronIcon open={moreOpen} />
        </button>
        {moreOpen && (
          <p id="limits-more" style={{ margin: '0 0 0 26px' }}>
            * Locked test set of 83 real scans from the Mendeley dataset (Mojahid et al. 2025), confidence ≥ 0.25, IoU 0.5: recall 0.90 for
            utilities and 0.51 for voids, about 0.55 false boxes per scan (mean of three training seeds); mAP@0.5 of the shipped model 0.79.
            The model was trained on real Mendeley scans only, so accuracy drops on data unlike them (other antennas, soils, processing),
            and depths assume a single constant velocity. Verify results independently.
          </p>
        )}
      </aside>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button type="button" className="btn ghost signin-min" onClick={onSignIn} aria-haspopup="dialog">
          <UserIcon />
          Sign in
        </button>
        <button
          type="button"
          className="btn ghost icon signin-min"
          onClick={onSettings}
          aria-haspopup="dialog"
          aria-label="Settings"
          title="Settings"
        >
          <GearIcon />
        </button>
      </div>
    </nav>
  )
}
