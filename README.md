# Veterinaria API

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
│   └── errorHandler.js
├── models/
├── routes/
│   └── healthRoutes.js
├── services/
└── utils/
    └── logger.js
```

El endpoint `GET /api/health` sirve para verificar que la API esté activa.
