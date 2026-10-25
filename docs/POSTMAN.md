# Colección Postman - Sprint 2

La colección [Veterinaria-API.postman_collection.json](../postman/Veterinaria-API.postman_collection.json)
prueba los endpoints disponibles del módulo de autenticación y la ruta
protegida:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

## Configuración

1. Instala Postman.
2. Importa la colección `postman/Veterinaria-API.postman_collection.json`.
3. Importa `postman/Veterinaria-API.local.postman_environment.json`.
4. Selecciona el entorno **Veterinaria API - Local**.
5. Ajusta `baseUrl` si el backend no está en `http://localhost:3000`.
6. Configura el backend con MongoDB y un `JWT_SECRET` local; no coloques esos
   secretos en la colección ni en el entorno exportado.
7. Inicia la API con `npm start` o `npm run dev`.

## Ejecución

Ejecuta la carpeta raíz **Veterinaria API - Sprint 2** con **Run collection**.
La solicitud de registro genera automáticamente un correo único y guarda sus
datos en variables de colección. Después, la solicitud de login guarda el JWT
para la prueba de la ruta protegida.

La colección contiene pruebas para:

- Registro exitoso (`201`) y respuesta sin contraseña.
- Registro con datos inválidos (`400`).
- Registro con correo duplicado (`409`).
- Login exitoso (`200`) y token JWT.
- Login con credenciales incorrectas (`401`).
- Login con datos inválidos (`400`).
- Ruta protegida sin token (`401`).
- Ruta protegida con token inválido (`401`).
- Esquema de autorización distinto de Bearer (`401`).
- Ruta protegida con token válido (`200`).

Cada solicitud incluye scripts `pm.test` que validan estado HTTP, `success`,
mensajes y campos relevantes. Postman marca como fallida cualquier aserción que
no se cumpla o cualquier solicitud que no pueda conectarse al backend.

## Evidencia de validación

Se verificó la exportación localmente:

- JSON de colección y entorno válidos.
- 10 solicitudes exportadas.
- 10 de 10 solicitudes contienen scripts de pruebas.
- Todas las variables usadas (`baseUrl`, `registeredEmail`,
  `registeredPassword`, `authToken` e `invalidToken`) están declaradas.
- La suite Jest existente continúa aprobada: 6 suites y 34 pruebas.
- Ejecución HTTP real con Newman contra MongoDB Atlas: 10 solicitudes, 19
  aserciones y 0 fallos.
- Reporte JUnit generado en `reports/newman-results.xml`.
- Una ejecución contra un puerto inválido devolvió código de salida `1`, por
  lo que los errores de conexión producen una ejecución fallida.

Durante la primera ejecución se detectó y corrigió un conflicto de precedencia
entre variables de colección y de entorno: `registeredEmail` y `authToken` se
guardan ahora en ambos alcances para que la colección funcione igual desde
Postman y Newman.

## Newman desde la línea de comandos

Newman está declarado en `devDependencies`, por lo que `npm install` instala
la versión reproducible usada por el proyecto. Los comandos disponibles son:

```bash
npm run postman:run
npm run postman:run:ci
```

Ambos comandos ejecutan la colección y el entorno exportados. Además generan
`reports/newman-results.xml` en formato JUnit. La carpeta `reports/` está
ignorada por Git para no subir resultados generados.

Para usar otra URL sin editar la colección o el entorno:

```bash
npm run postman:run -- --env-var "baseUrl=http://localhost:4000"
```

En PowerShell se puede ejecutar directamente:

```powershell
npx newman run postman\Veterinaria-API.postman_collection.json `
  -e postman\Veterinaria-API.local.postman_environment.json `
  --env-var "baseUrl=http://localhost:4000" `
  --reporters cli,junit `
  --reporter-junit-export reports\newman-results.xml
```

`postman:run:ci` agrega `--bail` para detenerse ante el primer fallo. Newman
devuelve un código de salida distinto de cero cuando no puede conectarse al
backend, falla una aserción o se produce un error de ejecución; esto permite
que un pipeline futuro detecte la ejecución fallida. GitHub Actions queda
fuera del alcance de esta tarea.

La ejecución requiere que la API esté iniciada y que MongoDB Atlas permita la
IP del equipo. `JWT_SECRET` y `MONGODB_URI` se configuran únicamente en el
`.env` local, que está ignorado por Git y nunca se pasan como argumentos de
Newman.
