import { useId, useState, type FormEvent } from 'react'
import { MIN_PASSWORD, checkCredentials, continueWithGoogle, logIn, signUp } from '../lib/auth'
import { Dialog } from './Dialog'

type Tab = 'login' | 'signup'

interface Props {
  open: boolean
  onClose: () => void
}

/** Log in / Sign up / Continue as guest. Email + password or Google. */
export function AuthDialog({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const id = useId()

  /** Forget the password and any message when the dialog closes. */
  const close = () => {
    setPassword('')
    setError(null)
    setPending(false)
    onClose()
  }

  const attempt = async (fn: () => Promise<unknown>) => {
    setPending(true)
    setError(null)
    try {
      await fn()
      close()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again')
    } finally {
      setPending(false)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const c = { email: email.trim(), password }
    const problem = checkCredentials(c, tab)
    if (problem) {
      setError(problem)
      return
    }
    void attempt(() => (tab === 'login' ? logIn(c) : signUp(c)))
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    setError(null)
  }

  return (
    <Dialog open={open} onClose={close} title={tab === 'login' ? 'Log in to GPRadar' : 'Create your account'} width={400}>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Save analyses and find them again under Projects</p>

      <div className="seg" role="tablist" aria-label="Account">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'login'}
          className={tab === 'login' ? 'on' : ''}
          onClick={() => switchTab('login')}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'signup'}
          className={tab === 'signup' ? 'on' : ''}
          onClick={() => switchTab('signup')}
        >
          Sign up
        </button>
      </div>

      <button
        type="button"
        className="btn"
        style={{ width: '100%', minHeight: 40 }}
        disabled={pending}
        onClick={() => attempt(continueWithGoogle)}
      >
        Continue with Google
      </button>

      <div className="or" aria-hidden="true">
        <span>or with email</span>
      </div>

      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="field">
          <label htmlFor={`${id}-email`}>Email</label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error?.includes('email') ? true : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-pw`}>Password {tab === 'signup' && <span className="src">at least {MIN_PASSWORD} characters</span>}</label>
          <input
            id={`${id}-pw`}
            type="password"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error?.includes('password') ? true : undefined}
          />
        </div>
        {error && (
          <p role="alert" className="warn">
            {error}
          </p>
        )}
        <button type="submit" className="btn primary" style={{ minHeight: 40 }} disabled={pending} aria-busy={pending}>
          {pending && <span className="spin" aria-hidden="true" />}
          {tab === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <button type="button" className="btn ghost" style={{ width: '100%' }} onClick={close}>
        Continue as guest
      </button>
    </Dialog>
  )
}
