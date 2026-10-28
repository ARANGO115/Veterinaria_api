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

## Mascotas

Las operaciones de mascotas requieren un token JWT y siempre se limitan al
usuario autenticado:

- `POST /api/pets` registra una mascota. Requiere `name` y `species`; también
  admite `breed`, `age`, `gender`, `weight`, `color`, `birthDate` y `notes`.
- `GET /api/pets` consulta las mascotas del usuario autenticado.
- `GET /api/pets/:id` consulta una mascota propia.
- `PUT /api/pets/:id` actualiza los datos proporcionados de una mascota propia.

Una mascota de otro usuario se trata como no encontrada y responde con `404`.

## Conectar con MongoDB Atlas

1. En MongoDB Atlas, crea un usuario de base de datos en **Database Access** y
   agrega la IP pública desde la que se ejecutará la API en **Network Access**.
2. En el cluster, selecciona **Connect > Drivers** y copia la URI de conexión.
3. Copia `.env.example` como `.env.development` en la raíz del proyecto y
   reemplaza `MONGODB_URI` con la URI real de Atlas. La estructura esperada es:

   ```dotenv
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net/veterinaria?retryWrites=true&w=majority&appName=Cluster0
   MONGODB_DNS_SERVERS=
   JWT_SECRET=reemplazar-por-un-secreto-aleatorio-largo
   JWT_EXPIRES_IN=1h
   ```

   Reemplaza `USUARIO`, `CONTRASENA` y el host por los datos que proporciona
   Atlas. Si la contraseña contiene caracteres reservados en URI (por ejemplo
   `@`, `:`, `/` o `#`), codifícalos para URL. No agregues espacios alrededor
   de `=` ni subas el archivo real `.env.development`.
4. Usa un secreto JWT propio y aleatorio; no reutilices la contraseña de MongoDB.
5. Instala las dependencias con `npm install` e inicia la API con `npm run dev`.

La API carga primero `.env.<entorno>` (por defecto, `.env.development`) desde la
raíz del proyecto y usa `.env` como alternativa. Las variables ya definidas en
el sistema tienen prioridad sobre los valores del archivo. Los archivos de
entorno reales están ignorados por Git; `.env.example` es la plantilla que se
puede compartir. La API no empieza a escuchar hasta conectarse a MongoDB.

Normalmente deja `MONGODB_DNS_SERVERS` vacío para usar el DNS del sistema. Si
Node informa `ECONNREFUSED` al consultar `_mongodb._tcp`, configura esa variable
con direcciones IP de DNS separadas por comas, autorizadas para tu red. Por
ejemplo, si la red permite Google Public DNS:

```dotenv
MONGODB_DNS_SERVERS=8.8.8.8,8.8.4.4
```

La configuración se aplica al proceso Node antes de cargar Mongoose, por lo que
también funciona con `npm run dev` y Nodemon. No configures `127.0.0.1` salvo
que haya un servidor DNS local activo allí. Un DNS alternativo solo ayuda a
resolver nombres; no evita restricciones de red, TLS, credenciales o acceso de
Atlas. No fijes DNS públicos en el repositorio si la red de tu organización
requiere resolvers propios.

Si no conecta, verifica que el usuario de **Database Access** y su contraseña
sean correctos, que la IP pública de salida esté permitida en **Network
Access**, y que la red permita DNS SRV y conexiones TLS salientes al puerto
27017. Un error TLS o de selección de servidores ocurre antes de autenticar al
usuario y no se corrige cambiando `JWT_SECRET`.

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
## Pruebas automatizadas

Las pruebas no requieren conexión a MongoDB: las pruebas de integración
mockean el servicio de autenticación y las pruebas unitarias aíslan el modelo,
bcrypt y JWT para que los resultados sean repetibles.

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:ci
```

La suite unitaria cubre `authService`, `authMiddleware` y la validación de
tokens. La suite de integración cubre registro, inicio de sesión, validación
de entradas y acceso protegido a `/api/health`.

## Colección Postman

La colección exportada de pruebas HTTP y su entorno local están disponibles
en `postman/`. Consulta [docs/POSTMAN.md](docs/POSTMAN.md) para importar,
configurar y ejecutar las solicitudes automatizadas de registro, login y
rutas protegidas. Newman también puede ejecutarlas desde la línea de comandos
con `npm run postman:run`.
