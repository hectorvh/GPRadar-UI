import { useCallback, useEffect, useState } from 'react'
import { ApiError, getHealth, getSamples } from '../lib/api'
import type { Health, Sample } from '../lib/types'

/** Free hosting sleeps when idle; waking can take about a minute. */
export const WAKE_TIMEOUT_MS = 75_000
const ATTEMPT_MS = 20_000
const RETRY_GAP_MS = 2_000
/** Show the wake-up banner only if /health has not answered by then. */
const SLOW_AFTER_MS = 1_000

export type BackendStatus = 'waking' | 'ok' | 'down'

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      resolve()
    }, { once: true })
  })

/** GET /health until it answers or 75 s pass; retryable. */
export function useBackend() {
  const [status, setStatus] = useState<BackendStatus>('waking')
  const [slow, setSlow] = useState(false)
  const [health, setHealth] = useState<Health | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const deadline = Date.now() + WAKE_TIMEOUT_MS
    const slowTimer = setTimeout(() => setSlow(true), SLOW_AFTER_MS)

    ;(async () => {
      while (!signal.aborted) {
        const remaining = deadline - Date.now()
        if (remaining <= 0) break
        try {
          const h = await getHealth(signal, Math.min(ATTEMPT_MS, remaining))
          if (signal.aborted) return
          setHealth(h)
          setStatus('ok')
          return
        } catch (e) {
          if (signal.aborted || (e instanceof ApiError && e.code === 'aborted')) return
          await sleep(Math.min(RETRY_GAP_MS, Math.max(0, deadline - Date.now())), signal)
        }
      }
      if (!signal.aborted) setStatus('down')
    })().finally(() => clearTimeout(slowTimer))

    return () => {
      controller.abort()
      clearTimeout(slowTimer)
    }
  }, [attempt])

  const retry = useCallback(() => {
    setStatus('waking')
    setSlow(true)
    setAttempt((n) => n + 1)
  }, [])

  return { status, slow, health, retry }
}

export type SamplesState =
  | { status: 'loading' }
  | { status: 'ok'; samples: Sample[] }
  | { status: 'error' }

/** GET /samples once the backend is awake. */
export function useSamples(ready: boolean): SamplesState {
  const [state, setState] = useState<SamplesState>({ status: 'loading' })

  useEffect(() => {
    if (!ready) return
    const controller = new AbortController()
    getSamples(controller.signal)
      .then((samples) => setState({ status: 'ok', samples }))
      .catch((e) => {
        if (!(e instanceof ApiError && e.code === 'aborted')) setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [ready])

  return state
}
