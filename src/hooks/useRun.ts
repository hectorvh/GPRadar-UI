import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, postRun, type RunRequest } from '../lib/api'
import { megabytes } from '../lib/format'
import type { ErrorCode, InputKind, RunResponse } from '../lib/types'
import { maxBytes } from '../lib/validate'

export type RunStatus = 'idle' | 'queued' | 'uploading' | 'running' | 'done' | 'error'

export interface RunState {
  status: RunStatus
  /** Upload progress 0–1, null when unknown. */
  progress: number | null
  /** True while waiting 3 s to retry after 503 busy. */
  retrying: boolean
  result: RunResponse | null
  error: { code: ErrorCode; message: string } | null
}

const INITIAL: RunState = { status: 'idle', progress: null, retrying: false, result: null, error: null }
const BUSY_RETRY_MS = 3_000

/** User-facing text for an API error code (spec 3.4). */
export function errorMessage(code: ErrorCode, serverMessage: string, kind: InputKind | null): string {
  switch (code) {
    case 'too_large':
      return `File too large (max ${megabytes(maxBytes(kind ?? 'gprmax'))})`
    case 'unsupported_type':
      return 'Unsupported file type. Use PNG, JPG or gprMax output (.out, .h5)'
    case 'rate_limited':
      return 'Too many runs, try again in a minute'
    case 'busy':
      return 'Server busy, try again in a few seconds'
    case 'timeout':
    case 'client_timeout':
      return 'Took too long; try a smaller file'
    case 'invalid_metadata':
      return `Invalid metadata: ${serverMessage}`
    case 'bad_request':
      return `The server could not process this input: ${serverMessage}`
    case 'network':
      return 'Could not reach the detector server. Check your connection and try again'
    default:
      return 'Something went wrong on the server. Try again'
  }
}

const delay = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new ApiError(0, 'aborted', 'aborted'))
    }, { once: true })
  })

/**
 * idle → (queued →) uploading → running → done | error.
 * A new run aborts the previous one. Runs requested before the backend is
 * awake are queued and start when `ready` turns true.
 */
export function useRun(ready: boolean, onDone?: (result: RunResponse) => void) {
  const [state, setState] = useState<RunState>(INITIAL)
  // Latest callback, so start() does not need to change when it does.
  const doneRef = useRef(onDone)
  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])
  const controller = useRef<AbortController | null>(null)
  const pending = useRef<{ req: RunRequest; kind: InputKind | null } | null>(null)

  const start = useCallback(async (req: RunRequest, kind: InputKind | null) => {
    controller.current?.abort()
    const ctrl = new AbortController()
    controller.current = ctrl
    const { signal } = ctrl
    const isUpload = !!req.file
    setState({ ...INITIAL, status: isUpload ? 'uploading' : 'running', progress: isUpload ? 0 : null })

    const attempt = () =>
      postRun(req, {
        signal,
        onUploadProgress: (f) => isUpload && !signal.aborted && setState((s) => ({ ...s, progress: f })),
        onUploaded: () => !signal.aborted && setState((s) => ({ ...s, status: 'running' })),
      })

    try {
      let result: RunResponse
      try {
        result = await attempt()
      } catch (e) {
        if (!(e instanceof ApiError) || e.code !== 'busy') throw e
        setState((s) => ({ ...s, retrying: true, status: 'running' }))
        await delay(BUSY_RETRY_MS, signal)
        setState((s) => ({ ...s, retrying: false, status: isUpload ? 'uploading' : 'running', progress: isUpload ? 0 : null }))
        result = await attempt()
      }
      if (signal.aborted) return
      setState({ ...INITIAL, status: 'done', result })
      doneRef.current?.(result)
    } catch (e) {
      if (signal.aborted) return
      const err = e instanceof ApiError ? e : new ApiError(0, 'internal_error', String(e))
      setState({ ...INITIAL, status: 'error', error: { code: err.code, message: errorMessage(err.code, err.message, kind) } })
    }
  }, [])

  const run = useCallback(
    (req: RunRequest, kind: InputKind | null) => {
      if (ready) {
        pending.current = null
        void start(req, kind)
      } else {
        controller.current?.abort()
        pending.current = { req, kind }
        setState({ ...INITIAL, status: 'queued' })
      }
    },
    [ready, start],
  )

  useEffect(() => {
    if (ready && pending.current) {
      const { req, kind } = pending.current
      pending.current = null
      void start(req, kind)
    }
  }, [ready, start])

  const reset = useCallback(() => {
    controller.current?.abort()
    controller.current = null
    pending.current = null
    setState(INITIAL)
  }, [])

  /** Show a stored result (an opened project) without calling the API. */
  const show = useCallback((result: RunResponse) => {
    controller.current?.abort()
    controller.current = null
    pending.current = null
    setState({ ...INITIAL, status: 'done', result })
  }, [])

  useEffect(() => () => controller.current?.abort(), [])

  return { ...state, run, reset, show }
}
