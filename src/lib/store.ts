import type { Analysis, Project } from './library'

/**
 * Projects and analyses in IndexedDB (results include PNGs, too big for
 * localStorage). Falls back to memory when IndexedDB is unavailable (private
 * mode, tests): the app still works, nothing is kept after a reload then.
 */
const DB = 'gpradar-library'
const VERSION = 1
export type StoreName = 'analyses' | 'projects'
type Row<S extends StoreName> = S extends 'analyses' ? Analysis : Project

const memory: Record<StoreName, Map<string, unknown>> = { analyses: new Map(), projects: new Map() }
let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null)
      const req = indexedDB.open(DB, VERSION)
      req.onupgradeneeded = () => {
        for (const s of ['analyses', 'projects'] as const) {
          if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s, { keyPath: 'id' })
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

function request<T>(db: IDBDatabase, store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(store, mode).objectStore(store))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
  })
}

export async function getAll<S extends StoreName>(store: S): Promise<Row<S>[]> {
  const db = await openDb()
  if (!db) return [...memory[store].values()] as Row<S>[]
  return request(db, store, 'readonly', (s) => s.getAll() as IDBRequest<Row<S>[]>)
}

export async function put<S extends StoreName>(store: S, row: Row<S>): Promise<void> {
  const db = await openDb()
  if (!db) {
    memory[store].set(row.id, row)
    return
  }
  await request(db, store, 'readwrite', (s) => s.put(row))
}

export async function remove(store: StoreName, id: string): Promise<void> {
  const db = await openDb()
  if (!db) {
    memory[store].delete(id)
    return
  }
  await request(db, store, 'readwrite', (s) => s.delete(id))
}
