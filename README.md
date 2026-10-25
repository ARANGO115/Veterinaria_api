# Veterinaria API

## Registro de usuarios

`POST /api/auth/register` permite crear una cuenta. Envía un objeto JSON con:

```json
{
  "name": "Ana Castro",
  "email": "ana@example.com",
  "password": "una-clave-segura"
}
```

El nombre debe tener al menos 2 caracteres, el correo debe ser válido y la
contraseña debe tener al menos 8 caracteres. La API responde con `201` cuando
el registro se completa, `400` ante datos inválidos y `409` si el correo ya
está registrado. La contraseña se guarda como hash y no se incluye en la
respuesta.

## Inicio de sesión

`POST /api/auth/login` recibe las credenciales de un usuario registrado:

```json
{
  "email": "ana@example.com",
  "password": "una-clave-segura"
}
```

Al autenticar correctamente responde con `200`, los datos públicos del usuario
y un token JWT. Las credenciales incorrectas responden con `401`; los datos
inválidos responden con `400`. Configura `JWT_SECRET` y, opcionalmente,
`JWT_EXPIRES_IN` en el archivo de entorno.

## Rutas protegidas

`GET /api/health` requiere un token JWT válido. Envíalo en el encabezado
`Authorization` usando el esquema Bearer:

```text
Authorization: Bearer <token>
```

Las solicitudes sin token, con un esquema distinto o con un token inválido o
expirado responden con `401`. Las rutas `/api/auth/register` y
`/api/auth/login` permanecen públicas para permitir el registro y la
autenticación.
## Conectar con MongoDB Atlas

1. En MongoDB Atlas, crea un usuario de base de datos y agrega la IP desde la que
   se ejecutará la API en **Network Access**.
2. En el cluster, selecciona **Connect > Drivers** y copia la URI de conexión.
3. Copia `.env.example` como `.env` (o `.env.development`) y reemplaza
   `MONGODB_URI` con la URI real de Atlas. No compartas ni subas ese archivo.
   Si la contraseña contiene caracteres especiales, codifícala para URL.
4. Cambia `JWT_SECRET` por un secreto propio.
5. Instala las dependencias con `npm install` e inicia la API con `npm run dev`.

La API busca `.env.<entorno>` (por defecto, `.env.development`) en la raíz del
proyecto y usa `.env` como alternativa. Los archivos de entorno locales están
ignorados por Git; `.env.example` es la plantilla que se puede compartir. La API
se conecta a MongoDB antes de escuchar y muestra un error si falla la conexión.

## Estructura

```text
src/
├── app.js
├── server.js
├── config/
│   └── database.js
├── controllers/
│   └── healthController.js
├── middlewares/
│   ├── authMiddleware.js
│   └── errorHandler.js
├── models/
├── routes/
│   └── healthRoutes.js
├── services/
└── utils/
    └── logger.js
```

El endpoint `GET /api/health` sirve para verificar que la API esté activa.

## Integración continua

El workflow `.github/workflows/backend-ci.yml` ejecuta Jest en cada `push` a
`develop` o a la rama de esta tarea, y en cada `pull_request` dirigido a
`develop`. También puede iniciarse manualmente desde GitHub Actions. Usa Node.js
22, instala dependencias con `npm ci` y levanta un servicio MongoDB efímero para
las pruebas. Después inicia la API y ejecuta con Newman la colección
`postman/veterinaria-auth.postman_collection.json`.

La ejecución local de CI no requiere credenciales externas: MongoDB corre como
servicio del workflow y el secreto JWT configurado allí es exclusivo para
pruebas. La colección debe ser un archivo JSON válido y no vacío; de lo
contrario, el workflow falla antes de ejecutar Newman.
