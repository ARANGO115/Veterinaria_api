import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { PrivateAccess } from './auth/PrivateAccess.jsx'
import { Login } from './auth/Login.jsx'
import { PrivatePage } from './auth/PrivatePage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <nav aria-label="Navegación principal" className="session-nav">
          <Link to="/">Inicio</Link>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/privado">Área privada</Link>
        </nav>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privado" element={<PrivateAccess><PrivatePage /></PrivateAccess>} />
          <Route path="*" element={<main><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></main>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
