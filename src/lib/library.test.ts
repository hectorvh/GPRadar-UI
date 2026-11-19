import { describe, expect, it } from 'vitest'
import { runResult } from './fixtures'
import {
  analysesOf,
  analysesToPrune,
  independentAnalyses,
  nextName,
  shownCount,
  sortItems,
  uniqueStems,
  type Analysis,
  type Project,
} from './library'

const an = (id: string, updatedAt: number, extra: Partial<Analysis> = {}): Analysis => ({
  id,
  name: id,
  createdAt: updatedAt,
  updatedAt,
  pinned: false,
  archived: false,
  projectId: null,
  source: { kind: 'image', label: id, sampleId: null },
  mode: 'detector',
  threshold: 0.25,
  result: runResult(`${id}.png`),
  ...extra,
})
const pr = (id: string): Project => ({ id, name: id, createdAt: 0, updatedAt: 0, pinned: false, archived: false })

describe('library helpers', () => {
  it('sorts pinned first, then newest', () => {
    expect(sortItems([an('a', 1), an('b', 3), an('c', 2, { pinned: true })]).map((x) => x.id)).toEqual(['c', 'b', 'a'])
  })
  it('lists a project in the order analyses were added', () => {
    const list = [an('b', 5, { projectId: 'p', createdAt: 2 }), an('a', 1, { projectId: 'p', createdAt: 1 }), an('x', 9)]
    expect(analysesOf(list, 'p').map((x) => x.id)).toEqual(['a', 'b'])
  })
  it('treats analyses of a deleted project as independent', () => {
    const list = [an('a', 1, { projectId: 'gone' }), an('b', 1, { projectId: 'p' }), an('c', 1)]
    expect(independentAnalyses(list, [pr('p')]).map((x) => x.id)).toEqual(['a', 'c'])
  })
  it('never prunes pinned analyses or analyses in a project', () => {
    const list = [an('pin', 1, { pinned: true }), an('inproj', 1, { projectId: 'p' }), an('old', 2), an('new', 3)]
    expect(analysesToPrune(list, 3)).toEqual(['old'])
  })
  it('counts detections at the analysis threshold', () => {
    expect(shownCount(an('a', 1))).toBe(1)
  })
  it('finds the next free name', () => {
    expect(nextName('Project', ['Project 1', 'Project 3'])).toBe('Project 2')
  })
  it('makes safe, unique file stems', () => {
    expect(uniqueStems(['scan a.png', 'scan a.jpg', 'Ü/../x'])).toEqual(['scan_a', 'scan_a_2', 'x'])
  })
})
