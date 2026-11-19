import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, postRun } from '../lib/api'
import type { InputKind, MetadataInput, Mode, RunResponse } from '../lib/types'
import { errorMessage } from './useRun'

/**
 * A B-scan waiting to run in a project. Mode and metadata are fixed when it is
 * queued (one setup for every B-scan of a New analysis). Files live in memory
 * only, so the queue is lost on reload.
 */
export interface QueueItem {
  key: string
  projectId: string
  label: string
  kind: InputKind
  file?: File
  sampleId?: string
  mode: Mode
  metadata: MetadataInput
  status: 'pending' | 'running' | 'waiting' | 'error'
  error?: string
}

/** Pause before the one retry after a rate limit (the API allows 10 runs per minute). */
export const RATE_LIMIT_WAIT_MS = 60_000

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => (clearTimeout(t), reject(new ApiError(0, 'aborted', 'aborted'))), { once: true })
  })

/**
 * Runs queued B-scans one after another, oldest first, as soon as the backend
 * is ready (and the queue is not paused). Each finished run goes to onDone,
 * which saves it as an analysis, and leaves the queue; failed ones stay with
 * their message so they can be retried or removed.
 */
export function useBatch(ready: boolean, onDone: (item: QueueItem, result: RunResponse) => void) {
  const [items, setItemsState] = useState<QueueItem[]>([])
  const [paused, setPaused] = useState(false)
  const [current, setCurrent] = useState<QueueItem | null>(null)
  const itemsRef = useRef<QueueItem[]>([])
  const running = useRef(false)
  const ctrl = useRef<AbortController | null>(null)
  const doneRef = useRef(onDone)
  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  const setItems = useCallback((fn: (list: QueueItem[]) => QueueItem[]) => {
    itemsRef.current = fn(itemsRef.current)
    setItemsState(itemsRef.current)
  }, [])
  const patch = useCallback(
    (key: string, p: Partial<QueueItem>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...p } : i))),
    [setItems],
  )

  const pump = useCallback(async () => {
    if (running.current) return
    running.current = true
    const c = new AbortController()
    ctrl.current = c
    try {
      for (;;) {
        const item = itemsRef.current.find((i) => i.status === 'pending')
        if (!item || c.signal.aborted) break
        setCurrent(item)
        const req = { mode: item.mode, metadata: item.metadata, ...(item.file ? { file: item.file } : { sampleId: item.sampleId }) }
        patch(item.key, { status: 'running', error: undefined })
        try {
          let result: RunResponse
          try {
            result = await postRun(req, { signal: c.signal })
          } catch (e) {
            if (!(e instanceof ApiError) || (e.code !== 'rate_limited' && e.code !== 'busy')) throw e
            patch(item.key, { status: 'waiting' })
            await sleep(e.code === 'busy' ? 3_000 : RATE_LIMIT_WAIT_MS, c.signal)
            patch(item.key, { status: 'running' })
            result = await postRun(req, { signal: c.signal })
          }
          if (c.signal.aborted) break
          doneRef.current(item, result)
          setItems((list) => list.filter((i) => i.key !== item.key))
        } catch (e) {
          if (c.signal.aborted) {
            patch(item.key, { status: 'pending' })
            break
          }
          const err = e instanceof ApiError ? e : new ApiError(0, 'internal_error', String(e))
          patch(item.key, { status: 'error', error: errorMessage(err.code, err.message, item.kind) })
        }
      }
    } finally {
      running.current = false
      if (ctrl.current === c) ctrl.current = null
      setCurrent(null)
    }
  }, [patch, setItems])

  // Start (or continue) whenever there is pending work, the backend is up and the queue is not paused.
  const pendingCount = items.filter((i) => i.status === 'pending').length
  useEffect(() => {
    if (ready && !paused && pendingCount > 0 && !running.current) void pump()
  }, [ready, paused, pendingCount, pump])

  const add = useCallback(
    (more: QueueItem[]) => {
      setPaused(false)
      setItems((list) => [...list, ...more])
    },
    [setItems],
  )
  const removeItem = useCallback((key: string) => setItems((list) => list.filter((i) => i.key !== key)), [setItems])
  const clearProject = useCallback((projectId: string) => setItems((list) => list.filter((i) => i.projectId !== projectId)), [setItems])
  const retryFailed = useCallback(
    (projectId: string) => {
      setPaused(false)
      setItems((list) =>
        list.map((i) => (i.projectId === projectId && i.status === 'error' ? { ...i, status: 'pending', error: undefined } : i)),
      )
    },
    [setItems],
  )

  /** Pause: the running B-scan is cancelled and goes back to the queue. */
  const pause = useCallback(() => {
    setPaused(true)
    ctrl.current?.abort()
  }, [])
  const resume = useCallback(() => setPaused(false), [])

  useEffect(() => () => ctrl.current?.abort(), [])

  return { items, add, removeItem, clearProject, retryFailed, pause, resume, paused, runningProject: current?.projectId ?? null }
}
