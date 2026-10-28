## Recursos del proyecto

| Recurso | Enlace |
|---|---|
| Hoja Scrum | [Product Backlog](https://docs.google.com/spreadsheets/d/17Rp_m2-ghEEN34LfYPHlJPt6j6QXspvzzqwjJzizaCE/edit?gid=1258259743#gid=1258259743) |
| Jira | [Tablero y backlog SDGV](https://arangovallejo.atlassian.net/jira/software/projects/SDGV/boards/3/backlog) |
| Postman | [Colección y entorno compartidos](https://deividiazg5-8693917.postman.co/workspace/Deivi-Diaz%27s-Workspace~d0d8e4c3-27c8-4abe-82a6-0f588ca10247/environment/57606305-e41baa84-5ca5-479e-b6d1-ed35eed771dd?action=share&creator=57606305&active-environment=57606305-e41baa84-5ca5-479e-b6d1-ed35eed771dd) |
| GitHub Actions | [Ejecuciones del pipeline CI](https://github.com/ARANGO115/Veterinaria_api/actions) |

## Endpoints de la API

La API de Veterinaria permite gestionar usuarios, mascotas y citas veterinarias.

**Prefijo base:** `/api`

### Rutas públicas

No requieren autenticación mediante JWT.

| Método | Endpoint | Descripción |
|:---:|---|---|
| `POST` | `/api/auth/register` | Registrar un usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |

### Rutas protegidas

Requieren un token JWT válido.

| Método | Endpoint | Descripción |
|:---:|---|---|
| `GET` | `/api/health` | Verificar el estado de la API |
| `POST` | `/api/pets` | Registrar una mascota |
| `GET` | `/api/pets` | Listar las mascotas del usuario |
| `GET` | `/api/pets/:id` | Consultar una mascota por su ID |
| `PUT` | `/api/pets/:id` | Actualizar una mascota |
| `POST` | `/api/appointments` | Programar una cita veterinaria |
| `GET` | `/api/appointments` | Listar citas veterinarias |
| `GET` | `/api/appointments/:id` | Consultar una cita por su ID |
| `PATCH` | `/api/appointments/:id/reschedule` | Reprogramar una cita |
| `PATCH` | `/api/appointments/:id/cancel` | Cancelar una cita |

El parámetro `:id` representa el identificador de la mascota o cita correspondiente.

### Autenticación

Para acceder a las rutas protegidas, inicia sesión en `POST /api/auth/login` y utiliza el token JWT recibido en la cabecera de cada solicitud:

```http
Authorization: Bearer <tu_token_jwt>
```

## Configuración del entorno

Crea un archivo `.env.development` en la raíz del proyecto y configura las siguientes variables con los valores de tu entorno:

```dotenv
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net/veterinaria?retryWrites=true&w=majority&appName=Cluster0

MONGODB_DNS_SERVERS=

JWT_SECRET=reemplazar-por-un-secreto-aleatorio-largo
JWT_EXPIRES_IN=1h
```

Reemplaza los valores de ejemplo por tus propias credenciales. Si la contraseña de MongoDB contiene caracteres especiales, codifícalos para URL.

No publiques archivos `.env` reales ni compartas credenciales o secretos. Mantén `.env.example` como plantilla sin datos sensibles.

## Ejecución local

Instala las dependencias e inicia la API:

```bash
npm install
npm run dev
```

Por defecto, la API utiliza el puerto `3000` y necesita conectarse a MongoDB antes de aceptar solicitudes.

## Pruebas automatizadas

Ejecuta las pruebas de Jest:

```bash
npm test
```

Para ejecutar la colección de Postman mediante Newman:

```bash
npm run postman:run
```

Consulta la documentación disponible en [`docs/POSTMAN.md`](docs/POSTMAN.md) para obtener instrucciones adicionales.

## Integración continua

El workflow de GitHub Actions ejecuta las pruebas de Jest, valida la colección de Postman y utiliza Newman para probar los endpoints HTTP.

El archivo de configuración se encuentra en [`.github/workflows/backend-ci.yml`](https://github.com/ARANGO115/Veterinaria_api/blob/develop/.github/workflows/backend-ci.yml).

Consulta los resultados de cada ejecución en [GitHub Actions](https://github.com/ARANGO115/Veterinaria_api/actions).

