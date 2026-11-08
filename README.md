# Veterinaria

Repositorio organizado como monorepo. El backend Express/MongoDB está en
[`backend/`](backend/); `frontend/` queda reservado para la futura aplicación
React con Vite. El workflow de CI permanece en [`.github/workflows/`](.github/workflows/).

## Backend

Consulta la [guía del backend](backend/README.md) para endpoints, MongoDB Atlas,
variables de entorno y pruebas.
También está disponible el [documento del parcial](backend/SegundoParcial.md).

Para desarrollo local, desde la raíz del repositorio:

```powershell
cd backend
Copy-Item .env.example .env.development
npm install
npm run dev
```

Configura `MONGODB_URI` y `JWT_SECRET` en `backend/.env.development` antes de
iniciar el servidor. Ejecuta las pruebas desde `backend/` con `npm test`.

## Render

Al actualizar la configuración del servicio existente, usa:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm run start`
