/**
 * Accounts are not implemented yet. The sign-in dialog calls these functions so
 * the UI is ready; wire them to an auth provider (e.g. Supabase Auth or
 * Firebase Auth, both support email + password and Google) when the API can
 * store analyses. Until then every call rejects with AuthUnavailableError.
 */
export const AUTH_AVAILABLE = false

export class AuthUnavailableError extends Error {
  constructor() {
    super('Accounts are not available yet. You can keep using GPRadar as a guest')
    this.name = 'AuthUnavailableError'
  }
}

export interface Credentials {
  email: string
  password: string
}

export async function logIn(_c: Credentials): Promise<never> {
  void _c
  throw new AuthUnavailableError()
}

export async function signUp(_c: Credentials): Promise<never> {
  void _c
  throw new AuthUnavailableError()
}

export async function continueWithGoogle(): Promise<never> {
  throw new AuthUnavailableError()
}

/** Minimum password length shown in the sign-up form. */
export const MIN_PASSWORD = 8

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Client-side checks only; returns an error message or null. */
export function checkCredentials(c: Credentials, mode: 'login' | 'signup'): string | null {
  if (!EMAIL.test(c.email.trim())) return 'Enter a valid email address'
  if (!c.password) return 'Enter your password'
  if (mode === 'signup' && c.password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters for the password`
  return null
}

/** The signed-in account, or null for a guest. Always null until accounts exist. */
export interface Account {
  email: string
}

export function currentAccount(): Account | null {
  return null
}

/** Text the user types to confirm account deletion (GitHub-style). */
export const DELETE_CONFIRM_TEXT = 'delete my account'

/** Delete the account and its saved analyses. Needs a server-side function once accounts exist. */
export async function deleteAccount(): Promise<never> {
  throw new AuthUnavailableError()
}
