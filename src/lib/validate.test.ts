import { describe, expect, it } from 'vitest'
import {
  MAX_GPRMAX_BYTES,
  MAX_IMAGE_BYTES,
  SNIFF_BYTES,
  checkMagic,
  checkNameAndSize,
  extension,
  kindFromName,
  sniff,
  validateFile,
} from './validate'

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const JPEG = [0xff, 0xd8, 0xff, 0xe0]
const HDF5 = [0x89, 0x48, 0x44, 0x46, 0x0d, 0x0a, 0x1a, 0x0a]

function bytes(sig: number[], offset = 0, length = 64) {
  const b = new Uint8Array(Math.max(length, offset + sig.length))
  b.set(sig, offset)
  return b
}

const file = (content: Uint8Array<ArrayBuffer>, name: string) => new File([content], name)

describe('extension and kind', () => {
  it.each([
    ['scan.PNG', 'png', 'image'],
    ['scan.jpg', 'jpg', 'image'],
    ['scan.jpeg', 'jpeg', 'image'],
    ['model.out', 'out', 'gprmax'],
    ['model.h5', 'h5', 'gprmax'],
    ['line.DZT', 'dzt', null],
    ['noext', '', null],
    ['archive.png.exe', 'exe', null],
  ])('%s', (name, ext, kind) => {
    expect(extension(name)).toBe(ext)
    expect(kindFromName(name)).toBe(kind)
  })
})

describe('sniff (magic bytes)', () => {
  it('recognises PNG, JPEG and HDF5', () => {
    expect(sniff(bytes(PNG))).toBe('png')
    expect(sniff(bytes(JPEG))).toBe('jpeg')
    expect(sniff(bytes(HDF5))).toBe('hdf5')
  })
  it('finds HDF5 after a user block (512, 1024, 2048)', () => {
    for (const offset of [512, 1024, 2048]) expect(sniff(bytes(HDF5, offset, SNIFF_BYTES))).toBe('hdf5')
  })
  it('ignores HDF5 at other offsets', () => {
    expect(sniff(bytes(HDF5, 100, SNIFF_BYTES))).toBeNull()
  })
  it('rejects unknown content and short input', () => {
    expect(sniff(new TextEncoder().encode('<html><script>'))).toBeNull()
    expect(sniff(new Uint8Array([0x89, 0x50]))).toBeNull()
    expect(sniff(new Uint8Array())).toBeNull()
  })
})

describe('checkNameAndSize', () => {
  it('accepts images up to 10 MB and gprMax up to 20 MB', () => {
    expect(checkNameAndSize('a.png', MAX_IMAGE_BYTES)).toEqual({ ok: true, kind: 'image' })
    expect(checkNameAndSize('a.out', MAX_GPRMAX_BYTES)).toEqual({ ok: true, kind: 'gprmax' })
  })
  it('rejects files over the limit with the limit in the message', () => {
    expect(checkNameAndSize('a.png', MAX_IMAGE_BYTES + 1)).toEqual({ ok: false, message: 'File too large (max 10 MB)' })
    expect(checkNameAndSize('a.h5', MAX_GPRMAX_BYTES + 1)).toEqual({ ok: false, message: 'File too large (max 20 MB)' })
  })
  it('rejects empty files and unsupported extensions', () => {
    expect(checkNameAndSize('a.png', 0)).toMatchObject({ ok: false, message: 'The file is empty' })
    expect(checkNameAndSize('a.dzt', 100)).toMatchObject({ ok: false, message: expect.stringContaining('Unsupported file type') })
  })
})

describe('checkMagic', () => {
  it('accepts content that matches the extension kind', () => {
    expect(checkMagic('image', bytes(JPEG))).toEqual({ ok: true, kind: 'image', type: 'jpeg' })
    expect(checkMagic('gprmax', bytes(HDF5))).toEqual({ ok: true, kind: 'gprmax', type: 'hdf5' })
  })
  it('accepts a PNG saved as .jpg (both are images; the API decodes by content)', () => {
    expect(checkMagic('image', bytes(PNG))).toMatchObject({ ok: true, type: 'png' })
  })
  it('rejects mismatches between extension and content', () => {
    expect(checkMagic('image', bytes(HDF5))).toMatchObject({ ok: false, message: expect.stringContaining('does not match') })
    expect(checkMagic('gprmax', bytes(PNG))).toMatchObject({ ok: false })
  })
})

describe('validateFile', () => {
  it('passes a real-looking PNG', async () => {
    expect(await validateFile(file(bytes(PNG), 'scan.png'))).toEqual({ ok: true, kind: 'image', type: 'png' })
  })
  it('passes a gprMax file with a user block', async () => {
    expect(await validateFile(file(bytes(HDF5, 512, 4096), 'model.out'))).toEqual({ ok: true, kind: 'gprmax', type: 'hdf5' })
  })
  it('rejects HTML renamed to .png', async () => {
    const html = new TextEncoder().encode('<!doctype html><script>alert(1)</script>')
    expect(await validateFile(file(html, 'evil.png'))).toMatchObject({ ok: false })
  })
  it('rejects by extension before reading the content', async () => {
    expect(await validateFile(file(bytes(PNG), 'scan.dzt'))).toMatchObject({ ok: false })
  })
})
