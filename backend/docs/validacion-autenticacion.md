# Validación del módulo de autenticación

## 1. Información general

- **Tarea:** Revisar y validar el módulo de autenticación.
- **Objetivo:** Comprobar los requisitos de autenticación y autorización de las
  rutas HTTP montadas por la API, sus errores y los intentos de acceso inválidos.
- **Alcance:** Rutas actualmente montadas, middleware JWT, servicio/modelo de
  usuario, limitación de solicitudes y pruebas de autenticación. No se probaron
  rutas de mascotas ni citas porque sus archivos están vacíos y no se montan.
- **Fecha de ejecución:** 2026-10-25.
- **Tecnología:** Node.js, Express 5, Mongoose, JWT, bcryptjs, Jest y Supertest.
- **Archivos relevantes revisados:**
  - `src/app.js`
  - `src/server.js`
  - `src/routes/authRoutes.js`
  - `src/routes/healthRoutes.js`
  - `src/controllers/authController.js`
  - `src/controllers/healthController.js`
  - `src/services/authService.js`
  - `src/models/User.js`
  - `src/middlewares/authMiddleware.js`
  - `src/middlewares/validateLogin.js`
  - `src/middlewares/validateRegistration.js`
  - `src/middlewares/errorHandler.js`
  - `src/utils/jwt.js`
  - `src/config/database.js`
  - `tests/auth.test.js`
  - `tests/health.test.js`
  - `tests/jwt.test.js`
  - `tests/authService.test.js`
  - `tests/rateLimit.test.js`
  - `package.json`, `jest.config.js` y `.env.example`

## 2. Inventario de rutas

Solo se incluyen rutas montadas y confirmadas en `src/app.js`.

| Método HTTP | Ruta real | Función | ¿Requiere autenticación? | Rol o permiso requerido | Middleware responsable |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | Registrar usuario | No | Ninguno | `validateRegistration` |
| POST | `/api/auth/login` | Iniciar sesión y emitir JWT | No | Ninguno | `validateLogin` |
| GET | `/api/health` | Comprobar estado de la API | Sí | Ninguno | `authMiddleware` |

No hay roles, permisos ni niveles de acceso definidos en el modelo de usuario o
en las rutas montadas. Los archivos de rutas de mascotas y citas están vacíos y
no se registran en la aplicación; no se consideran endpoints disponibles.

## 3. Revisión de middlewares

### Autenticación

El cliente envía el JWT en el encabezado `Authorization` con el esquema Bearer.
`authMiddleware` responde `401` cuando falta el encabezado, no usa el esquema
esperado, el valor está vacío, el token no se puede verificar o expiró, no
contiene un `sub` con formato ObjectId, o el usuario ya no existe. Las respuestas
de token no válido y usuario inexistente usan el mismo mensaje para no revelar
el estado de cuentas.

El helper `verifyToken` valida la firma con `JWT_SECRET`; el servicio de login
emite tokens con el identificador del usuario en `sub` y una expiración
configurable mediante `JWT_EXPIRES_IN` (por defecto, `1h`). Si `JWT_SECRET` falta,
el error se delega al manejador global y no se disfraza como credencial inválida.

Después de verificar la firma, el middleware consulta `User.findById`. Una
consulta fallida se delega al manejador global de Express y produce un `500`
genérico, en lugar de clasificarse como fallo de autenticación.

### Autorización

No hay middleware de roles ni rutas privilegiadas montadas. El esquema de
usuario no contiene un campo de rol. El servicio de registro acepta solamente
nombre, correo y contraseña al construir el usuario; un campo `role` adicional
del cliente no se persiste.

### Errores y limitación de solicitudes

- `400`: datos de login/registro inválidos o JSON inválido.
- `401`: token ausente/no válido o credenciales de login incorrectas.
- `409`: correo duplicado al registrar.
- `429`: se supera el límite de solicitudes de la API.
- `500`: error interno; el mensaje de respuesta no expone el detalle de la
  excepción.

El rate limiter de `/api` permite 100 solicitudes por ventana de 15 minutos y
devuelve una respuesta JSON controlada. Se movió antes del montaje de las rutas
de autenticación para que login y registro también queden limitados.

## 4. Casos de prueba

Los casos marcados como ejecutados se realizaron con Jest/Supertest. Las pruebas
de rutas reemplazan el servicio o el modelo por mocks controlados; no conectan a
MongoDB ni usan cuentas reales. Las pruebas de servicio usan bcrypt/JWT reales y
un modelo simulado.

| Identificador | Escenario | Ruta probada | Resultado esperado | Resultado obtenido | Código HTTP | Estado | Evidencia o comentario |
|---|---|---|---|---|---:|---|---|
| AUTH-01 | Solicitud sin token | `GET /api/health` | Rechazar sin consultar usuario | Rechazada | 401 | APROBADO | `tests/health.test.js` |
| AUTH-02 | Esquema de autorización incorrecto o valor sin token | `GET /api/health` | Rechazar encabezado mal formado | Rechazada | 401 | APROBADO | Casos parametrizados en `tests/health.test.js` |
| AUTH-03 | JWT inválido | `GET /api/health` | Rechazar sin consultar usuario | Rechazado | 401 | APROBADO | `tests/health.test.js` |
| AUTH-04 | JWT expirado | `GET /api/health` | Rechazar sin consultar usuario | Rechazado | 401 | APROBADO | `tests/health.test.js` |
| AUTH-05 | JWT válido y usuario existente | `GET /api/health` | Continuar a la ruta | Acceso permitido | 200 | APROBADO | Consulta del usuario simulada; `tests/health.test.js` |
| AUTH-06 | JWT válido pero usuario inexistente | `GET /api/health` | Rechazar con error de autenticación genérico | Rechazado | 401 | APROBADO | Consulta sin resultado simulada; `tests/health.test.js` |
| AUTH-07 | Error de infraestructura consultando el usuario | `GET /api/health` | Responder error interno controlado | Respuesta genérica sin detalle interno | 500 | APROBADO | Excepción del modelo simulada; `tests/health.test.js` |
| AUTH-08 | Registro con datos válidos | `POST /api/auth/register` | Crear y responder sin contraseña | Respuesta de éxito | 201 | APROBADO | Prueba HTTP con servicio simulado; `tests/auth.test.js` |
| AUTH-09 | Login con credenciales válidas | `POST /api/auth/login` | Responder con JWT y datos públicos | Respuesta de éxito; servicio verifica hash y firma JWT | 200 | APROBADO | `tests/auth.test.js` y `tests/authService.test.js` |
| AUTH-10 | Login con credenciales incorrectas | `POST /api/auth/login` | Rechazar sin distinguir usuario/contraseña | Rechazado | 401 | APROBADO | Prueba HTTP y servicio con hash bcrypt; `tests/auth.test.js`, `tests/authService.test.js` |
| AUTH-11 | Registro enviando `role: admin` | `POST /api/auth/register` / servicio | No asignar privilegios enviados por cliente | El servicio solo construye el usuario con nombre, correo y contraseña | N/A | APROBADO | Prueba directa del servicio; `tests/authService.test.js` |
| AUTH-12 | Exceso de solicitudes a login | `POST /api/auth/login` | Aplicar límite y responder controladamente | Se observó `429` y mensaje JSON esperado | 429 | APROBADO | 110 solicitudes en entorno de prueba; `tests/rateLimit.test.js` |
| AUTH-13 | Datos de login/registro inválidos y correo duplicado | Endpoints de autenticación | `400` por datos inválidos; `409` por duplicado | Respuestas esperadas | 400 / 409 | APROBADO | `tests/auth.test.js` |
| AUTH-14 | Token con firma inválida o vencido en helper JWT | Helper de verificación | No aceptar el token | Rechazado | N/A | APROBADO | `tests/jwt.test.js` |

Los códigos `N/A` corresponden a pruebas del servicio/helper que no realizan una
solicitud HTTP.

## 5. Defectos encontrados

### AUTH-DEF-01 — No se comprobaba la existencia del usuario del JWT

- **Severidad:** Media.
- **Ubicación:** `src/middlewares/authMiddleware.js`, verificación del JWT.
- **Riesgo:** Un JWT válido seguía permitiendo acceso a rutas protegidas después
  de eliminarse el usuario asociado, mientras el token no expirara.
- **Corrección aplicada:** Validar que `sub` tenga formato ObjectId y consultar
  el usuario antes de continuar. Si no existe, responder `401` sin revelar la
  condición específica.
- **Prueba de regresión:** AUTH-05, AUTH-06 y AUTH-07 en `tests/health.test.js`.

### AUTH-DEF-02 — El rate limiter no cubría las rutas de autenticación

- **Severidad:** Media.
- **Ubicación:** `src/app.js`, orden de montaje de `authRoutes` y rate limiter.
- **Riesgo:** Las solicitudes a login y registro pasaban antes del limitador,
  permitiendo intentos repetidos sin el límite global configurado.
- **Corrección aplicada:** Montar el limitador de `/api` antes de las rutas de
  autenticación.
- **Prueba de regresión:** AUTH-12 en `tests/rateLimit.test.js`.

No se confirmó una asignación de roles privilegiados por registro: el rol no
existe en el esquema y el servicio selecciona explícitamente los campos
persistidos. Tampoco hay operaciones con autorización por rol que puedan
probarse en las rutas montadas.

## 6. Cambios realizados

- `src/app.js`: se adelantó el rate limiter para incluir las rutas públicas de
  autenticación.
- `src/middlewares/authMiddleware.js`: ahora valida el identificador del token y
  comprueba la existencia del usuario; los errores de infraestructura continúan
  hacia el manejador global.
- `tests/health.test.js`: se añadieron pruebas HTTP para encabezados ausentes o
  mal formados, tokens inválidos/expirados, usuario existente/inexistente y
  errores de base de datos simulados.
- `tests/authService.test.js`: se añadieron pruebas del servicio con bcrypt/JWT
  reales y del filtrado de campos privilegiados.
- `tests/rateLimit.test.js`: se añadió la prueba HTTP de límite para login.
- `docs/validacion-autenticacion.md`: se documentan inventario, resultados,
  defectos y reproducción.

No se modificaron dependencias ni archivos de configuración local. No se hizo
commit ni push.

## 7. Evidencias de ejecución

Comandos ejecutados:

1. `npm test -- --runInBand` antes de instalar dependencias: no pudo iniciar,
   porque Jest no estaba instalado en el entorno.
2. `npm ci`: instaló las 431 dependencias fijadas en el lockfile. npm informó
   dos avisos de vulnerabilidad en dependencias (una moderada y una alta); no se
   aplicaron actualizaciones automáticas ni se atribuyeron a este módulo.
3. `npm test -- --runInBand` tras instalar dependencias y antes de cambios:
   **3 suites y 20 pruebas pasaron**.
4. Primera ejecución de pruebas posteriores a los cambios: detectó que la prueba
   de 110 solicitudes compartía el limitador en memoria con otros casos. La
   prueba se aisló en `tests/rateLimit.test.js`.
5. `npm test -- --runInBand` tras aislar el caso: **4 suites y 26 pruebas
   pasaron**.
6. `npm test -- --runInBand` con las pruebas de servicio nuevas: **5 suites y
   29 pruebas pasaron**. Un ajuste posterior del ObjectId de prueba dejó una
   expectativa con el identificador anterior; esa ejecución tuvo una aserción
   fallida y se corrigió.
7. `npm test -- --runInBand` final: **5 suites y 29 pruebas pasaron**.

La API no se conectó a una base de datos durante las pruebas. Las interacciones
de persistencia se sustituyeron por mocks para que los casos sean reproducibles
y no afecten datos reales. La dependencia se instaló desde el lockfile; no se
modificó `package.json` ni `package-lock.json`.

## 8. Resultado final

| Criterio de aceptación | Estado | Evidencia |
|---|---|---|
| Las rutas protegidas rechazan solicitudes sin autenticación válida | CUMPLIDO | AUTH-01 a AUTH-04 y AUTH-06 |
| Los tokens inválidos o expirados no permiten el acceso | CUMPLIDO | AUTH-03, AUTH-04 y AUTH-14 |
| Las solicitudes válidas pueden continuar cuando cumplen los requisitos de acceso | CUMPLIDO | AUTH-05 y AUTH-09 |
| Los errores se comunican mediante respuestas controladas | CUMPLIDO | AUTH-01 a AUTH-04, AUTH-07, AUTH-10 y AUTH-13 |
| Las verificaciones y los defectos encontrados quedan documentados | CUMPLIDO | Este documento y los resultados finales de Jest |

No hay rutas con requisitos de rol actualmente. La autorización por rol queda
fuera del comportamiento implementado y solo será verificable cuando existan
rutas y permisos de ese tipo.

## 9. Instrucciones de reproducción

1. Usar una versión de Node.js compatible con el `package-lock.json`.
2. Desde la raíz del proyecto, instalar las dependencias fijadas:

   ```powershell
   npm ci
   ```

3. Ejecutar la suite completa:

   ```powershell
   npm test -- --runInBand
   ```

Las pruebas no requieren `.env`, MongoDB, credenciales reales ni cuentas. Los
tests asignan un secreto únicamente al proceso de Jest y lo usan para firmar
tokens de prueba.

## Pendientes, limitaciones y riesgos residuales

- La comprobación de usuario fue validada con el modelo simulado; queda pendiente
  una prueba de integración conectada a una instancia MongoDB de pruebas aislada.
- El modelo no incluye un estado de cuenta desactivada ni una lista de revocación.
  La comprobación añadida rechaza usuarios eliminados, pero los tokens de un
  usuario existente siguen siendo válidos hasta expirar.
- El limitador usa el almacén en memoria predeterminado. En despliegues con
  varios procesos o instancias, conviene configurar un almacén compartido y
  revisar límites específicos para login.
- `npm ci` reportó dos vulnerabilidades de dependencias; su alcance y remediación
  no se analizaron en esta validación de autenticación.
