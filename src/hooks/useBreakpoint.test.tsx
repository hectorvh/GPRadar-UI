// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useBreakpoint } from './useBreakpoint'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

/** matchMedia stand-in that evaluates (min-width) / (max-width) against a settable width. */
function mockMatchMedia(initial: number) {
  let width = initial
  const lists: { query: string; listeners: Set<() => void> }[] = []
  const matches = (q: string) => {
    const min = /min-width:\s*(\d+)px/.exec(q)
    const max = /max-width:\s*(\d+)px/.exec(q)
    return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]))
  }
  window.matchMedia = ((query: string) => {
    const entry = { query, listeners: new Set<() => void>() }
    lists.push(entry)
    return {
      media: query,
      get matches() {
        return matches(query)
      },
      addEventListener: (_: string, fn: () => void) => entry.listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => entry.listeners.delete(fn),
    } as unknown as MediaQueryList
  }) as typeof window.matchMedia
  return {
    resize(w: number) {
      width = w
      for (const l of lists) for (const fn of l.listeners) fn()
    },
  }
}

function Probe() {
  return <output>{useBreakpoint()}</output>
}

let host: HTMLDivElement
let root: Root

beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})
afterEach(() => {
  act(() => root.unmount())
  host.remove()
})

const render = () => act(() => root.render(<Probe />))
const shown = () => host.querySelector('output')?.textContent

describe('useBreakpoint', () => {
  it.each([
    [320, 'phone'],
    [390, 'phone'],
    [640, 'phone'],
    [641, 'tablet'],
    [768, 'tablet'],
    [1024, 'tablet'],
    [1025, 'desktop'],
    [1440, 'desktop'],
  ])('%i px is %s', (width, expected) => {
    mockMatchMedia(width)
    render()
    expect(shown()).toBe(expected)
  })

  it('follows the window across breakpoints', () => {
    const mq = mockMatchMedia(1440)
    render()
    expect(shown()).toBe('desktop')
    act(() => mq.resize(768))
    expect(shown()).toBe('tablet')
    act(() => mq.resize(390))
    expect(shown()).toBe('phone')
  })

  it('falls back to desktop without matchMedia', () => {
    // @ts-expect-error: simulate an environment without matchMedia
    window.matchMedia = undefined
    render()
    expect(shown()).toBe('desktop')
  })
})
