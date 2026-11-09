import { Navigate, Outlet, useLocation } from 'react-router-dom'

function hasSessionToken() {
  return Boolean(
    localStorage.getItem('token') ||
      localStorage.getItem('jwtToken') ||
      localStorage.getItem('accessToken'),
  )
}

function ProtectedRoute() {
  const location = useLocation()

  if (!hasSessionToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
