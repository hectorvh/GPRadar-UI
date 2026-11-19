/**
 * Client checks before upload: extension, size and magic bytes. The API runs
 * the same checks (by content, not name); these only save a round trip.
 */
import { megabytes } from './format'
import type { InputKind } from './types'

/** Limits of GPRadar-API 1.1 (MAX_IMAGE_BYTES, MAX_UPLOAD_BYTES). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_GPRMAX_BYTES = 20 * 1024 * 1024

export const ACCEPT = '.png,.jpg,.jpeg,.out,.h5'

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const JPEG = [0xff, 0xd8, 0xff]
const HDF5 = [0x89, 0x48, 0x44, 0x46, 0x0d, 0x0a, 0x1a, 0x0a]
/** HDF5 allows a user block, so the signature may sit at 0, 512, 1024 or 2048. */
const HDF5_OFFSETS = [0, 512, 1024, 2048]
export const SNIFF_BYTES = 2048 + HDF5.length

export type Sniffed = 'png' | 'jpeg' | 'hdf5'

const EXT_KIND: Record<string, InputKind> = {
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  out: 'gprmax',
  h5: 'gprmax',
}

export function extension(name: string): string {
  const m = /\.([^./\\]+)$/.exec(name)
  return m ? m[1].toLowerCase() : ''
}

export function kindFromName(name: string): InputKind | null {
  return EXT_KIND[extension(name)] ?? null
}

function startsWith(bytes: Uint8Array, sig: number[], offset = 0): boolean {
  if (bytes.length < offset + sig.length) return false
  return sig.every((b, i) => bytes[offset + i] === b)
}

export function sniff(bytes: Uint8Array): Sniffed | null {
  if (startsWith(bytes, PNG)) return 'png'
  if (startsWith(bytes, JPEG)) return 'jpeg'
  if (HDF5_OFFSETS.some((o) => startsWith(bytes, HDF5, o))) return 'hdf5'
  return null
}

export function maxBytes(kind: InputKind): number {
  return kind === 'image' ? MAX_IMAGE_BYTES : MAX_GPRMAX_BYTES
}

export type Validation =
  | { ok: true; kind: InputKind; type: Sniffed }
  | { ok: false; message: string }

const UNSUPPORTED = 'Unsupported file type. Use PNG, JPG or gprMax output (.out, .h5)'

/** Checks that need only the name and size (sync). */
export function checkNameAndSize(name: string, size: number): Validation | { ok: true; kind: InputKind } {
  const kind = kindFromName(name)
  if (!kind) return { ok: false, message: UNSUPPORTED }
  if (size === 0) return { ok: false, message: 'The file is empty' }
  const limit = maxBytes(kind)
  if (size > limit) return { ok: false, message: `File too large (max ${megabytes(limit)})` }
  return { ok: true, kind }
}

/** Magic bytes must agree with the extension's kind. */
export function checkMagic(kind: InputKind, head: Uint8Array): Validation {
  const type = sniff(head)
  if (!type) return { ok: false, message: `${UNSUPPORTED}. The file content was not recognised` }
  const contentKind: InputKind = type === 'hdf5' ? 'gprmax' : 'image'
  if (contentKind !== kind) {
    return { ok: false, message: 'The file extension does not match its content' }
  }
  return { ok: true, kind, type }
}

export async function validateFile(file: File): Promise<Validation> {
  const basic = checkNameAndSize(file.name, file.size)
  if (!basic.ok) return basic
  const head = new Uint8Array(await file.slice(0, SNIFF_BYTES).arrayBuffer())
  return checkMagic(basic.kind, head)
}
