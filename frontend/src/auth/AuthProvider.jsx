import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthContext } from './AuthContext'
import { getTokenExpiration, isValidSession, readSession, SESSION_KEY } from './session'

const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')
const MAX_TIMEOUT = 2147483647

async function responseError(response) {
  const body = await response.json().catch(() => null)
  return new Error(body?.message || `La solicitud falló (${response.status})`)
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'checking', session: null, error: null })
  const currentSession = useRef(null)
  const operation = useRef(0)

  const clearSession = useCallback((error = null) => {
    operation.current += 1
    currentSession.current = null
    try {
      localStorage.removeItem(SESSION_KEY)
      setState({ status: 'anonymous', session: null, error })
    } catch {
      setState({
        status: 'anonymous',
        session: null,
        error: 'No se pudo eliminar la sesión guardada en el navegador.',
      })
    }
  }, [])

  const restore = useCallback(async () => {
    const version = ++operation.current
    currentSession.current = null
    setState({ status: 'checking', session: null, error: null })

    try {
      const session = readSession()
      if (!session) {
        if (version === operation.current) {
          setState({ status: 'anonymous', session: null, error: null })
        }
        return
      }

      const response = await fetch(`${apiUrl}/health`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      if (version !== operation.current) return
      if (response.status === 401 || !isValidSession(session)) {
        clearSession()
        return
      }
      if (!response.ok) throw await responseError(response)
      const body = await response.json()
      if (body.success !== true || body.message !== 'Veterinaria API funcionando correctamente') {
        throw new Error('La API devolvió una respuesta de validación inesperada.')
      }
      if (version !== operation.current) return
      if (!isValidSession(session)) {
        clearSession()
        return
      }

      currentSession.current = session
      setState({ status: 'authenticated', session, error: null })
    } catch (error) {
      if (version === operation.current) {
        setState({
          status: 'error',
          session: null,
          error: `No se pudo verificar la sesión: ${error.message}`,
        })
      }
    }
  }, [clearSession])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) restore()
    })
    return () => {
      active = false
      operation.current += 1
    }
  }, [restore])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === SESSION_KEY || event.key === null) restore()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [restore])

  useEffect(() => {
    if (!state.session) return
    let timer
    const checkExpiration = () => {
      if (currentSession.current?.token !== state.session.token) return
      const remaining = getTokenExpiration(state.session.token)?.expiresAt - Date.now()
      if (!Number.isFinite(remaining) || remaining <= 0) {
        clearSession()
      } else {
        timer = window.setTimeout(checkExpiration, Math.min(remaining, MAX_TIMEOUT))
      }
    }
    checkExpiration()
    return () => window.clearTimeout(timer)
  }, [state.session, clearSession])

  const login = useCallback(async ({ email, password }) => {
    const version = ++operation.current
    if (!currentSession.current) {
      setState({ status: 'anonymous', session: null, error: null })
    }
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw await responseError(response)
    const body = await response.json()
    const session = body.data
    if (!body.success || !isValidSession(session)) {
      throw new Error('La respuesta de autenticación no contiene una sesión válida.')
    }
    if (version !== operation.current) {
      throw new Error('El inicio de sesión fue cancelado.')
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    currentSession.current = session
    setState({ status: 'authenticated', session, error: null })
    return session.user
  }, [])

  const authFetch = useCallback(async (path, options = {}) => {
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
      throw new Error('La ruta de la API debe comenzar con /.')
    }
    const session = currentSession.current
    if (!isValidSession(session)) {
      if (session) clearSession()
      throw new Error('No hay una sesión válida.')
    }
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${session.token}`)
    const response = await fetch(`${apiUrl}${path}`, { ...options, headers })
    if (response.status === 401 && currentSession.current?.token === session.token) {
      clearSession('La sesión ha expirado o ya no es válida.')
    }
    return response
  }, [clearSession])

  const value = {
    user: state.session?.user ?? null,
    token: state.session?.token ?? null,
    status: state.status,
    error: state.error,
    login,
    logout: clearSession,
    retrySession: restore,
    authFetch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
