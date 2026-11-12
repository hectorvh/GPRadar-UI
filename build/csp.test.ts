import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { apiOrigin, buildCsp, inlineScriptHashes } from './csp'

describe('CSP generation', () => {
  it('hashes exactly the inline theme script in index.html', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    const body = /<script>([\s\S]*?)<\/script>/.exec(html)![1]
    const expected = `'sha256-${createHash('sha256').update(body).digest('base64')}'`
    expect(inlineScriptHashes(html)).toEqual([expected])
  })

  it('skips external and module scripts', () => {
    expect(inlineScriptHashes('<script type="module" src="/src/main.tsx"></script><script src="/a.js"></script>')).toEqual([])
  })

  it('puts the API origin (not the path) in connect-src', () => {
    expect(apiOrigin('https://gpradar-api.onrender.com/')).toBe('https://gpradar-api.onrender.com')
    expect(buildCsp('https://api.example.org/v1', ["'sha256-x'"])).toContain("connect-src 'self' https://api.example.org;")
  })

  it('rejects non-http URLs', () => {
    expect(() => apiOrigin('javascript:alert(1)')).toThrow()
    expect(() => apiOrigin('not a url')).toThrow()
  })

  it('keeps the policy from the spec', () => {
    const csp = buildCsp('https://api.example.org', ["'sha256-x'"])
    expect(csp).toBe(
      "default-src 'self'; script-src 'self' 'sha256-x'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; " +
        "font-src 'self'; connect-src 'self' https://api.example.org; frame-ancestors 'none'; base-uri 'self'; form-action 'none'",
    )
  })
})
