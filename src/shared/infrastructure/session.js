/**
 * Session helper (Identity, Profiles & Security support infrastructure).
 * Persists the authenticated user's session (profile + API bearer token)
 * in localStorage so the SPA survives a page refresh, and centralizes route-guard access checks.
 */
const SESSION_KEY = 'flotix:session'

export const Session = {
  set(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  },
  get() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY))
    } catch {
      return null
    }
  },
  clear() {
    localStorage.removeItem(SESSION_KEY)
  },
  isAuthenticated() {
    return !!this.get()?.token
  }
}
