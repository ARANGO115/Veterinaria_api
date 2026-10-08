# Resultados de Pruebas - Sprint 1

## 1. Objetivo

Documentar los resultados de las pruebas realizadas sobre la API de la veterinaria, conservando evidencias que permitan verificar el cumplimiento de los objetivos del Sprint 1.

## 2. Entorno de pruebas

- Lenguaje: JavaScript
- Plataforma: Node.js
- Framework: Express
- Framework de pruebas: Jest
- Herramienta para pruebas HTTP: Supertest
- Base de datos configurada: MongoDB
- Comando utilizado: `npm test`

## 3. Pruebas unitarias

Actualmente no se encontraron pruebas unitarias implementadas en el repositorio correspondiente al Sprint 1.

El único archivo de pruebas disponible es `tests/health.test.js`, el cual realiza pruebas de integración sobre el endpoint `/api/health`.

Por lo tanto, no se registran resultados de pruebas unitarias que no hayan sido ejecutadas.

## 4. Pruebas de integración

### Caso 1: GET /api/health - Respuesta correcta

**Objetivo:** verificar que la API responda correctamente cuando el endpoint de salud está disponible.

**Solicitud:** `GET /api/health`

**Resultado esperado:**

- Código HTTP: `200`
- `success`: `true`
- Mensaje: `Veterinaria API funcionando correctamente`

**Resultado obtenido:** APROBADO.

### Caso 2: GET /api/endpoint-inexistente - Endpoint no existente

**Objetivo:** verificar el comportamiento de la API cuando se solicita un endpoint que no existe.

**Solicitud:** `GET /api/endpoint-inexistente`

**Resultado esperado:**

- Código HTTP: `404`

**Resultado obtenido:** APROBADO.

## 5. Resumen de resultados

| Tipo de prueba | Casos ejecutados | Aprobados | Fallidos |
|---|---:|---:|---:|
| Pruebas unitarias | 0 | 0 | 0 |
| Pruebas de integración | 2 | 2 | 0 |
| **Total** | **2** | **2** | **0** |

## 6. Evidencia de ejecución

Las pruebas fueron ejecutadas mediante el comando:

`npm test`

Resultado:

- Suite de pruebas: 1 aprobada.
- Pruebas ejecutadas: 2.
- Pruebas aprobadas: 2.
- Pruebas fallidas: 0.

La salida de `npm test` queda registrada como evidencia de la ejecución de las pruebas del Sprint 1.

## 7. Casos de error

Se validó un escenario de error mediante una solicitud a un endpoint inexistente.

El sistema respondió con código HTTP `404`, por lo que el comportamiento esperado fue validado correctamente.

No se presentaron fallos durante la ejecución de las pruebas.

## 8. Conclusión

Las pruebas de integración disponibles para el Sprint 1 fueron ejecutadas correctamente.

Se realizaron dos casos de prueba: un caso exitoso para `GET /api/health` y un caso de error para un endpoint inexistente.

Ambos casos fueron aprobados, obteniendo un resultado de 2 pruebas aprobadas de 2 ejecutadas.

Actualmente no existen pruebas unitarias en el repositorio revisado, por lo que no se registran resultados de este tipo.
