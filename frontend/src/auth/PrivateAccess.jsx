import { Navigate, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

export function PrivateAccess({ children }) {
  const location = useLocation()

  return (
    <ProtectedRoute
      loading={<p>Verificando sesión...</p>}
      fallback={<Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />}
    >
      {children}
    </ProtectedRoute>
  )
}
