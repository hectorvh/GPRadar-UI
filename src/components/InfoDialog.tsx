import { LINKS } from '../lib/links'
import { Dialog } from './Dialog'
import { LogoIcon } from './icons'

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

/** About, licences and data credits. Opened from the info button in the top bar. */
export function InfoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="About GPRadar" width={480} fullOnPhone>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <LogoIcon size={40} />
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          Research prototype that detects hyperbolas (buried pipes, cables, voids) in ground-penetrating radar B-scans with a YOLO model.
        </p>
      </div>
      <div className="info-block">
        <p>
          GPRadar is open source ·{' '}
          <a href={LINKS.uiLicense} {...ext}>
            License (MIT)
          </a>{' '}
          ·{' '}
          <a href={LINKS.api} {...ext}>
            API source (AGPL-3.0)
          </a>
        </p>
        <p style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href={LINKS.gpradar} {...ext}>
            GitHub repository
          </a>
          <a href={LINKS.model} {...ext}>
            Model (Hugging Face)
          </a>
          <a href={LINKS.readme} {...ext}>
            Project README
          </a>
          {LINKS.linkedin && (
            <a href={LINKS.linkedin} {...ext}>
              LinkedIn
            </a>
          )}
        </p>
      </div>
      <div className="info-block">
        <p className="sec-title">Data</p>
        <p>
          Real-scan samples: Mojahid et al. (2025), Mendeley Data,{' '}
          <a href={LINKS.dataset} {...ext}>
            DOI 10.17632/ww7fd9t325.1
          </a>
          , CC BY 4.0. Synthetic samples simulated with gprMax (Warren et al. 2016).
        </p>
      </div>
    </Dialog>
  )
}
