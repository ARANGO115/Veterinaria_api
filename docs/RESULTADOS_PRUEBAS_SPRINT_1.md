# Resultados de pruebas de autenticación

## Entorno reproducible

- Node.js y npm definidos por las dependencias del proyecto.
- Jest 30 y Supertest 7.
- `NODE_ENV=test` no requiere configuración de MongoDB.
- Las pruebas unitarias mockean `User`, `bcryptjs`, `jsonwebtoken` y la
  verificación de tokens.
- Las pruebas de integración ejercitan la aplicación Express con Supertest y
  mockean `authService`.

## Escenarios ejecutados

| Suite | Enfoque | Escenarios |
|---|---|---|
| `authService.test.js` | Bottom-up | registro, login válido, usuario inexistente, contraseña incorrecta y secreto JWT ausente |
| `authMiddleware.test.js` | Bottom-up | encabezado ausente/incorrecto, token válido e inválido |
| `jwt.test.js` | Bottom-up | firma válida, firma inválida y token expirado |
| `auth.test.js` | Top-down | registro, login, validaciones 400, credenciales 401 y correo duplicado 409 |
| `health.test.js` | Top-down | ruta protegida sin token, esquema inválido, token inválido y token válido |

El enfoque **Bottom-up** parte de las unidades internas (servicio, middleware
y utilidad JWT) y verifica sus contratos de forma aislada. El enfoque
**Top-down** parte de las rutas HTTP y atraviesa validadores, controladores y
middleware hasta comprobar la respuesta observable de la API.

## Resultados y defectos corregidos

La ejecución se realiza con:

```bash
npm test
```

Resultado obtenido: **5 suites aprobadas, 31 pruebas aprobadas y 0 fallos**.
La ejecución con `npm run test:ci` también fue aprobada y produjo 86.3% de
cobertura de statements y 73.33% de cobertura de branches, sin conexión a
servicios externos. Durante la preparación se corrigieron:

1. El script de prueba no ofrecía comandos diferenciados para unitarias,
   integración y CI.
2. `tests/health.test.js` tenía truncado el valor del encabezado
   `Authorization`, lo que impedía analizar la prueba.
3. La documentación del Sprint 1 indicaba que no existían pruebas unitarias y
   no describía los flujos de autenticación actuales.

## Criterios cubiertos

- Jest se ejecuta mediante `test`, `test:unit`, `test:integration` y `test:ci`.
- Se cubren entradas válidas, inválidas y errores 401, 409 y configuración
  ausente.
- Registro, inicio de sesión y protección de rutas tienen escenarios de
  integración identificables.
- La ausencia de MongoDB durante las pruebas evita dependencia de datos
  persistentes y permite ejecuciones repetibles.
