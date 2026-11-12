import { LINKS } from '../lib/links'

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

export function Footer() {
  return (
    <footer style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 2px 4px', fontSize: 12, color: 'var(--muted)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span>
          GPRadar is open source · <a href={LINKS.uiLicense} {...ext}>License (MIT)</a> ·{' '}
          <a href={LINKS.api} {...ext}>API source (AGPL-3.0)</a>
        </span>
        <span style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href={LINKS.gpradar} {...ext}>GitHub repository</a>
          <a href={LINKS.model} {...ext}>Model (Hugging Face)</a>
          {LINKS.linkedin && (
            <a href={LINKS.linkedin} {...ext}>LinkedIn</a>
          )}
        </span>
      </div>
      <p style={{ margin: 0 }}>
        Real-scan samples: Mojahid et al. (2025), Mendeley Data,{' '}
        <a href={LINKS.dataset} {...ext}>DOI 10.17632/ww7fd9t325.1</a>, CC BY 4.0. Synthetic samples simulated with gprMax (Warren et al. 2016).
      </p>
    </footer>
  )
}
