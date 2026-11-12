import { useId, useState } from 'react'
import type { SamplesState } from '../hooks/useBackend'
import { LINKS } from '../lib/links'
import type { Sample } from '../lib/types'
import { GithubIcon, LogoIcon, PanelLeftIcon, PlusIcon, SampleIcon, UserIcon, WarnIcon } from './icons'

interface Props {
  width: number
  samples: SamplesState
  activeSampleId: string | null
  onPickSample: (s: Sample) => void
  onNewAnalysis: () => void
  onHide: () => void
}

export function LeftNav({ width, samples, activeSampleId, onPickSample, onNewAnalysis, onHide }: Props) {
  const [query, setQuery] = useState('')
  const signinHint = useId()
  const q = query.trim().toLowerCase()
  const list =
    samples.status === 'ok'
      ? samples.samples.filter((s) => !q || `${s.name} ${s.description} ${s.citation}`.toLowerCase().includes(q))
      : []

  return (
    <nav
      className="panel scroll"
      aria-label="Projects"
      style={{
        width,
        flex: '0 0 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '14px 12px',
        borderRight: '1px solid var(--border)',
        background: 'var(--nav)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
          <LogoIcon />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>GPRadar</span>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}
            >
              by <GithubIcon />
              hectorvh
            </a>
          </div>
        </div>
        <button type="button" className="btn ghost icon" aria-label="Hide project menu" onClick={onHide}>
          <PanelLeftIcon />
        </button>
      </div>

      <button type="button" className="btn" style={{ justifyContent: 'flex-start' }} onClick={onNewAnalysis}>
        <PlusIcon />
        New analysis
      </button>

      <div className="field">
        <label htmlFor="psearch" className="sr">
          Search samples
        </label>
        <input id="psearch" type="search" placeholder="Search projects" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <p className="sec-title" style={{ padding: '4px 10px' }} id="samples-title">
          Samples
        </p>
        {samples.status === 'loading' && (
          <p style={{ margin: 0, padding: '0 10px', fontSize: 13, color: 'var(--muted)' }}>Loading samples…</p>
        )}
        {samples.status === 'error' && (
          <p style={{ margin: 0, padding: '0 10px', fontSize: 13, color: 'var(--muted)' }}>Samples are unavailable right now.</p>
        )}
        {samples.status === 'ok' && list.length === 0 && (
          <p style={{ margin: 0, padding: '0 10px', fontSize: 13, color: 'var(--muted)' }}>No samples match.</p>
        )}
        <ul aria-labelledby="samples-title" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {list.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={'proj' + (s.id === activeSampleId ? ' on' : '')}
                aria-current={s.id === activeSampleId ? 'true' : undefined}
                aria-describedby={`cite-${s.id}`}
                title={s.description}
                onClick={() => onPickSample(s)}
              >
                <SampleIcon />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              </button>
              <p className="cite" id={`cite-${s.id}`}>
                {s.citation}
              </p>
            </li>
          ))}
        </ul>
        <p className="sec-title" style={{ padding: '14px 10px 4px' }}>
          Your projects
        </p>
        <p style={{ margin: 0, padding: '0 10px', fontSize: 13, color: 'var(--muted)' }}>Sign in to save analyses and find them here.</p>
      </div>

      <aside role="note" className="note">
        <WarnIcon />
        <p style={{ margin: 0 }}>
          <strong>Prototype detector.</strong> Detections can be missed or false, accuracy drops on data unlike the training set (gprMax
          synthetic + Mendeley utilities scans), and depths assume a single constant velocity. Verify results independently before any
          excavation or engineering decision.
        </p>
      </aside>

      <button
        type="button"
        className="btn signin"
        style={{ minHeight: 40, width: '100%' }}
        aria-disabled="true"
        aria-describedby={signinHint}
        title="Accounts are coming later"
        onClick={(e) => e.preventDefault()}
      >
        <UserIcon />
        Sign in
        <span id={signinHint} className="sr">
          Accounts are coming later
        </span>
      </button>
    </nav>
  )
}
