/** Fetch wrappers for GPRadar-API with AbortController and timeouts. */
import type { ErrorBody, ErrorCode, Health, MetadataInput, Mode, RunResponse, Sample } from './types'

export const API_URL: string = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: ErrorCode

  constructor(status: number, code: ErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/** An AbortSignal that fires on the caller's signal or after `ms`. */
function withTimeout(ms: number, outer?: AbortSignal) {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, ms)
  const onAbort = () => controller.abort()
  if (outer) {
    if (outer.aborted) controller.abort()
    else outer.addEventListener('abort', onAbort, { once: true })
  }
  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    done: () => {
      clearTimeout(timer)
      outer?.removeEventListener('abort', onAbort)
    },
  }
}

function isErrorBody(value: unknown): value is ErrorBody {
  const err = (value as ErrorBody | null)?.error
  return !!err && typeof err.code === 'string' && typeof err.message === 'string'
}

function errorFrom(status: number, body: unknown): ApiError {
  if (isErrorBody(body)) return new ApiError(status, body.error.code, body.error.message)
  return new ApiError(status, status >= 500 ? 'internal_error' : 'bad_request', `HTTP ${status}`)
}

async function getJson<T>(path: string, timeoutMs: number, signal?: AbortSignal): Promise<T> {
  const t = withTimeout(timeoutMs, signal)
  try {
    let res: Response
    try {
      res = await fetch(`${API_URL}${path}`, { signal: t.signal, headers: { Accept: 'application/json' } })
    } catch {
      if (signal?.aborted) throw new ApiError(0, 'aborted', 'aborted')
      if (t.timedOut()) throw new ApiError(0, 'client_timeout', 'request timed out')
      throw new ApiError(0, 'network', 'could not reach the server')
    }
    const body: unknown = await res.json().catch(() => null)
    if (!res.ok) throw errorFrom(res.status, body)
    return body as T
  } finally {
    t.done()
  }
}

export function getHealth(signal?: AbortSignal, timeoutMs = 20_000) {
  return getJson<Health>('/health', timeoutMs, signal)
}

export function getSamples(signal?: AbortSignal) {
  return getJson<Sample[]>('/samples', 20_000, signal)
}

export interface RunRequest {
  file?: File
  sampleId?: string
  mode: Mode
  metadata: MetadataInput
}

export function buildRunForm(req: RunRequest): FormData {
  if (!!req.file === !!req.sampleId) throw new Error('exactly one of file or sampleId')
  const form = new FormData()
  if (req.file) form.append('file', req.file, req.file.name)
  if (req.sampleId) form.append('sample_id', req.sampleId)
  form.append('mode', req.mode)
  if (Object.keys(req.metadata).length > 0) form.append('metadata', JSON.stringify(req.metadata))
  return form
}

export interface RunOptions {
  signal?: AbortSignal
  /** Upload progress 0–1; called with 1 when the body has been sent. */
  onUploadProgress?: (fraction: number) => void
  /** Called when the upload is complete and the server is working. */
  onUploaded?: () => void
  timeoutMs?: number
}

/**
 * POST /run. Uses XMLHttpRequest, not fetch, because only XHR reports upload
 * progress in all current browsers.
 */
export function postRun(req: RunRequest, opts: RunOptions = {}): Promise<RunResponse> {
  const form = buildRunForm(req)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}/run`)
    xhr.responseType = 'json'
    xhr.timeout = opts.timeoutMs ?? 150_000
    xhr.setRequestHeader('Accept', 'application/json')

    const onAbort = () => xhr.abort()
    opts.signal?.addEventListener('abort', onAbort, { once: true })
    const cleanup = () => opts.signal?.removeEventListener('abort', onAbort)

    // Upload listeners make the browser send a CORS preflight, so only add them for file uploads.
    if (req.file) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) opts.onUploadProgress?.(e.loaded / e.total)
      }
      xhr.upload.onload = () => {
        opts.onUploadProgress?.(1)
        opts.onUploaded?.()
      }
    }
    xhr.onload = () => {
      cleanup()
      const body: unknown = xhr.response
      if (xhr.status >= 200 && xhr.status < 300 && body) resolve(body as RunResponse)
      else reject(errorFrom(xhr.status, body))
    }
    xhr.onerror = () => {
      cleanup()
      reject(new ApiError(0, 'network', 'could not reach the server'))
    }
    xhr.ontimeout = () => {
      cleanup()
      reject(new ApiError(0, 'client_timeout', 'request timed out'))
    }
    xhr.onabort = () => {
      cleanup()
      reject(new ApiError(0, 'aborted', 'aborted'))
    }
    if (opts.signal?.aborted) {
      cleanup()
      reject(new ApiError(0, 'aborted', 'aborted'))
      return
    }
    xhr.send(form)
  })
}
