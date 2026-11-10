import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function Login() {
  const { status, error, login, retrySession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const requestedPath = location.state?.from
  const destination = typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') && !requestedPath.startsWith('//') &&
    !requestedPath.startsWith('/login')
    ? requestedPath
    : '/privado'

  if (status === 'checking') return <p>Verificando sesión...</p>
  if (status === 'authenticated') return <Navigate to={destination} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate(destination, { replace: true })
    } catch (loginError) {
      setFormError(loginError.message || 'No se pudo iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="session-page">
      <h1>Iniciar sesión</h1>
      {error && (
        <div role="alert">
          <p>{error}</p>
          {status === 'error' && <button type="button" onClick={retrySession}>Reintentar verificación</button>}
        </div>
      )}
      <form className="session-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        {formError && <p role="alert">{formError}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
    </main>
  )
}
