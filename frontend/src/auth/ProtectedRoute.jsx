import { useAuth } from './AuthContext'

export function ProtectedRoute({ children, fallback = null, loading = null }) {
  const { status, error, retrySession } = useAuth()

  if (status === 'checking') return loading
  if (status === 'error') {
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={retrySession}>Reintentar</button>
      </div>
    )
  }
  return status === 'authenticated' ? children : fallback
}
