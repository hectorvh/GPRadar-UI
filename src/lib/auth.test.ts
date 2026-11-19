import { describe, expect, it } from 'vitest'
import { AuthUnavailableError, checkCredentials, logIn } from './auth'

describe('checkCredentials', () => {
  it('rejects a malformed email', () => {
    expect(checkCredentials({ email: 'hector', password: 'x' }, 'login')).toMatch(/email/)
  })
  it('needs a password', () => {
    expect(checkCredentials({ email: 'a@b.de', password: '' }, 'login')).toMatch(/password/)
  })
  it('needs 8 characters only when signing up', () => {
    expect(checkCredentials({ email: 'a@b.de', password: 'short' }, 'login')).toBeNull()
    expect(checkCredentials({ email: 'a@b.de', password: 'short' }, 'signup')).toMatch(/8 characters/)
  })
})

describe('auth placeholder', () => {
  it('rejects until a provider is wired in', async () => {
    await expect(logIn({ email: 'a@b.de', password: 'longenough' })).rejects.toBeInstanceOf(AuthUnavailableError)
  })
})
