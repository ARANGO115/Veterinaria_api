import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

function Page({ title, description }) {
  return (
    <main className="page">
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Page
              title="Veterinaria"
              description="Gestiona tus mascotas y citas desde un solo lugar."
            />
          }
        />
        <Route
          path="/login"
          element={
            <Page
              title="Iniciar sesión"
              description="Ruta pública para autenticarse en la plataforma."
            />
          }
        />
        <Route
          path="/register"
          element={
            <Page
              title="Crear cuenta"
              description="Ruta pública para registrar un usuario."
            />
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <Page
                title="Panel principal"
                description="Contenido disponible para usuarios autenticados."
              />
            }
          />
          <Route
            path="/pets"
            element={
              <Page
                title="Mis mascotas"
                description="Consulta y administra tus mascotas."
              />
            }
          />
          <Route
            path="/appointments"
            element={
              <Page
                title="Mis citas"
                description="Consulta y administra tus citas veterinarias."
              />
            }
          />
        </Route>

        <Route path="/404" element={<Page title="Página no encontrada" />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
