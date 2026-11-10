import { useAuth } from './AuthContext'

export function PrivatePage() {
  const { user, logout } = useAuth()

  return (
    <main className="session-page">
      <h1>Área privada</h1>
      <p>Sesión iniciada como {user.name}.</p>
      <button type="button" onClick={() => logout()}>Cerrar sesión</button>
    </main>
  )
}
