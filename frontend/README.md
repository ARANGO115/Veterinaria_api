# Frontend

Aplicación React con Vite. El estado de autenticación se proporciona mediante
`AuthProvider`, integrado en `src/main.jsx`, y se consume con `useAuth`.

## Sesión

Configura `VITE_API_URL` con la URL base de la API, incluido `/api`, para que el
frontend pueda comunicarse con el backend. Por defecto se usa `/api` en el mismo
origen; Vite no configura un proxy automáticamente. Por ejemplo, si el backend
local está en el puerto 3000, inicia el frontend desde PowerShell con:

```powershell
cd frontend
$env:VITE_API_URL = 'http://localhost:3000/api'
npm run dev
```

Inicia también el backend y usa las credenciales de un usuario ya registrado.
El servidor que publique el frontend debe devolver `index.html` para las rutas
del navegador, como `/login` y `/privado`, al acceder directamente o recargar.

```jsx
import { useAuth } from './auth/AuthContext'

function Ejemplo() {
  const { user, status, error, login, logout, authFetch } = useAuth()
  // login({ email, password }) devuelve el usuario o rechaza con un error.
  // authFetch('/pets') agrega el token y devuelve la respuesta de fetch.
}
```

Los estados son `checking`, `authenticated`, `anonymous` y `error`. El estado
`error` significa que no se pudo verificar la sesión; `retrySession()` permite
intentarlo nuevamente. El contexto rechaza el acceso mientras verifica la
sesión, elimina tokens expirados y cierra la sesión cuando una petición hecha
con `authFetch` responde `401`. La validación al recargar usa `GET /api/health`.
No se descifra ni valida la firma del JWT en el navegador: esa validación la
realiza el backend.

La aplicación incluye `/login` y una página mínima en `/privado` para el flujo
de sesión. Si se intenta acceder a `/privado` sin sesión válida, se redirige a
`/login`; después del inicio de sesión se vuelve a la ruta solicitada.
Mientras se verifica una sesión guardada, no se muestra el contenido privado.

Para proteger otras rutas, intégralas con `PrivateAccess` o utiliza
`ProtectedRoute` proporcionando los elementos de redirección y carga:

```jsx
import { ProtectedRoute } from './auth/ProtectedRoute'

<ProtectedRoute fallback={<p>Inicia sesión para continuar.</p>} loading={<p>Verificando sesión...</p>}>
  {/* Contenido privado */}
</ProtectedRoute>
```

Cada ruta privada debe integrar `ProtectedRoute` y las solicitudes protegidas
deben usar `authFetch`. El cierre de sesión elimina el token del navegador,
pero el backend no ofrece revocación y el JWT sigue siendo válido hasta su
expiración.

La sesión se almacena en `localStorage` para sobrevivir recargas y cierres del
navegador. Un script malicioso ejecutado en el origen puede leer el token;
los datos del usuario almacenados tampoco deben considerarse una fuente de
autorización. La API sigue siendo responsable de validar accesos.
# Frontend Veterinaria

Aplicación React con Vite. Requiere Node.js 22.

## Desarrollo local

Desde la raíz del repositorio:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

`VITE_API_BASE_URL` define la URL base del backend e incluye el prefijo `/api`.
En `.env`, reemplaza el host de ejemplo con la URL pública actual del servicio
de Render. No agregues credenciales ni secretos a las variables `VITE_*`, ya
que Vite las expone al navegador.

## Validaciones

Ejecuta desde `frontend/`:

```bash
npm run lint
npm run build
```

El workflow `../.github/workflows/frontend-ci.yml` ejecuta estas validaciones
en GitHub Actions. En esta etapa no se incluyen enrutamiento, acceso a API,
autenticación ni pruebas automatizadas del frontend.
