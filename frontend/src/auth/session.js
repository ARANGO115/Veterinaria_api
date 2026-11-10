export const SESSION_KEY = 'veterinaria.session'

export function getTokenExpiration(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || parts.some((part) => !part)) return null

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!Number.isFinite(payload.exp) || typeof payload.sub !== 'string') return null

    return { expiresAt: payload.exp * 1000, subject: payload.sub }
  } catch {
    return null
  }
}

export function isValidSession(session) {
  if (!session || typeof session.token !== 'string' || !session.user) return false

  const { id, name, email } = session.user
  if (![id, name, email].every((value) => typeof value === 'string' && value.trim())) {
    return false
  }

  const payload = getTokenExpiration(session.token)
  return Boolean(payload && payload.subject === id && payload.expiresAt > Date.now())
}

export function readSession() {
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null

  let session
  try {
    session = JSON.parse(stored)
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }

  if (!isValidSession(session)) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  return session
}
