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
