import { useId, useState } from 'react'
import { DELETE_CONFIRM_TEXT, deleteAccount, type Account } from '../lib/auth'
import { toggleMode, type Settings } from '../lib/settings'
import type { Mode } from '../lib/types'
import { Dialog } from './Dialog'

interface Props {
  open: boolean
  onClose: () => void
  settings: Settings
  onChange: (s: Settings) => void
  /** null = guest: nothing to delete. */
  account: Account | null
}

const MODES: { mode: Mode; label: string; hint: string }[] = [
  { mode: 'full', label: 'Full pipeline', hint: 'Time-zero, dewow, background removal and gain, then detection. For raw data' },
  { mode: 'detector', label: 'Detector only', hint: 'Only resizes and normalizes for the model. For already processed images' },
]

/** Preferences (saved in this browser) and the account Danger Zone. */
export function SettingsDialog({ open, onClose, settings, onChange, account }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const id = useId()
  const onlyOne = Object.values(settings.modes).filter(Boolean).length === 1

  const close = () => {
    setConfirming(false)
    setTyped('')
    setError(null)
    setPending(false)
    onClose()
  }

  const confirmDelete = async () => {
    setPending(true)
    setError(null)
    try {
      await deleteAccount()
      close()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The account could not be deleted. Try again')
    } finally {
      setPending(false)
    }
  }

  if (confirming && account) {
    const match = typed.trim().toLowerCase() === DELETE_CONFIRM_TEXT
    return (
      <Dialog open={open} onClose={close} title="Delete account" width={460}>
        <p className="danger-banner">Unexpected bad things will happen if you don’t read this!</p>
        <p style={{ fontSize: 13 }}>
          This will permanently delete the account <strong>{account.email}</strong> and all of its saved analyses. This cannot be undone.
        </p>
        <div className="field">
          <label htmlFor={`${id}-confirm`}>
            <span>
              To confirm, type “<strong style={{ color: 'var(--text)' }}>{DELETE_CONFIRM_TEXT}</strong>” below
            </span>
          </label>
          <input id={`${id}-confirm`} autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="warn">
            {error}
          </p>
        )}
        <button type="button" className="btn danger solid" disabled={!match || pending} aria-busy={pending} onClick={confirmDelete}>
          {pending && <span className="spin" aria-hidden="true" />}
          Delete this account
        </button>
        <button type="button" className="btn ghost" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={close} title="Settings" width={460}>
      <fieldset className="settings-group">
        <legend className="sec-title">Display</legend>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.showSamples}
            onChange={() => onChange({ ...settings, showSamples: !settings.showSamples })}
          />
          <span>
            <span className="check-label">View samples</span>
            <span className="check-hint">Show the bundled samples in the side menu and on the first screen</span>
          </span>
        </label>
      </fieldset>

      <fieldset className="settings-group">
        <legend className="sec-title">Processing modes</legend>
        {MODES.map(({ mode, label, hint }) => {
          const on = settings.modes[mode]
          const locked = on && onlyOne
          return (
            <label className="check" key={mode}>
              <input
                type="checkbox"
                checked={on}
                disabled={locked}
                aria-describedby={locked ? `${id}-last` : undefined}
                onChange={() => onChange(toggleMode(settings, mode))}
              />
              <span>
                <span className="check-label">{label}</span>
                <span className="check-hint">{hint}</span>
              </span>
            </label>
          )
        })}
        {onlyOne && (
          <p id={`${id}-last`} className="check-hint" style={{ margin: 0 }}>
            At least one mode must stay on. With one mode on, every run uses it
          </p>
        )}
      </fieldset>

      <p className="check-hint" style={{ margin: 0 }}>
        These settings are saved in this browser
      </p>

      <section aria-labelledby={`${id}-danger`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 id={`${id}-danger`} className="danger-title">
          Danger Zone
        </h3>
        <div className="danger-zone">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
            <strong style={{ fontSize: 14 }}>Delete this account</strong>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {account
                ? 'Once you delete your account, there is no going back. Your saved analyses are deleted too'
                : 'You are using GPRadar as a guest, so there is no account to delete'}
            </span>
          </div>
          <button type="button" className="btn danger" disabled={!account} onClick={() => setConfirming(true)}>
            Delete account
          </button>
        </div>
      </section>
    </Dialog>
  )
}
