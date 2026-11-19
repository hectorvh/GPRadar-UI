import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { runResult } from './fixtures'
import type { Analysis, Project } from './library'
import { projectZip } from './projectZip'

const project: Project = { id: 'p', name: 'Campus survey', createdAt: 0, updatedAt: 0, pinned: false, archived: false }
const analysis = (name: string): Analysis => ({
  id: name,
  name,
  createdAt: 0,
  updatedAt: 0,
  pinned: false,
  archived: false,
  projectId: 'p',
  source: { kind: 'image', label: name, sampleId: null },
  mode: 'detector',
  threshold: 0.25,
  result: runResult(`${name}.png`),
})

describe('projectZip', () => {
  it('has a CSV per analysis and a summary', async () => {
    const files = unzipSync(await projectZip(project, [analysis('line 1'), analysis('line 2')], { date: new Date('2026-11-17T12:00:00Z') }))
    expect(Object.keys(files).sort()).toEqual(['line_1/line_1.csv', 'line_2/line_2.csv', 'summary.csv'])
    const summary = strFromU8(files['summary.csv'])
    expect(summary).toContain('# GPRadar project: Campus survey')
    expect(summary).toContain('line 1,line 1.png,image,detector,0.25,1,2,abc1234,line_1/line_1.csv,')
  })
  it('adds annotated PNGs when a renderer is given, and survives one failing', async () => {
    let n = 0
    const png = async () => {
      if (n++ === 1) throw new Error('canvas')
      return new Blob([new Uint8Array([137, 80, 78, 71])])
    }
    const files = unzipSync(await projectZip(project, [analysis('a'), analysis('b')], { png }))
    expect(files['a/a_annotated.png']).toBeDefined()
    expect(files['b/b_annotated.png']).toBeUndefined()
  })
})
