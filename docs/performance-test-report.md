# Informe de pruebas de rendimiento

## Estado

Se completaron los escenarios de línea base (1 usuario), carga baja (5 usuarios) y carga moderada (10 usuarios) contra la API local. Las ejecuciones documentadas en este informe registraron respuestas HTTP `200` y cero errores de JMeter.

Una ejecución anterior de línea base, conservada como [`baseline.jtl`](../performance/results/baseline.jtl), tuvo un HTTP `500` en health. No se mezcla con la línea base válida ni con los resultados comparativos. Una repetición posterior de la línea base terminó sin errores y los tres perfiles se completaron correctamente.

## Objetivo y alcance

Evaluar `POST /api/auth/login` y `GET /api/health` con el plan [`veterinaria-api.jmx`](../performance/apache-jmeter/veterinaria-api.jmx), en el entorno local autorizado conectado a MongoDB Atlas.

## Condiciones de ejecución

| Dato | Valor |
| --- | --- |
| Fecha y zona horaria | 25 de octubre de 2026, COT (según los archivos de JMeter) |
| Entorno / URL (sin secretos) | API local, `http://127.0.0.1:4500` |
| Versión o commit de la API | Rama SDGV-45; commit exacto no registrado |
| Versión de JMeter y Java | Apache JMeter 5.6.3; Java 17 |
| Máquina generadora | Windows; especificaciones de hardware no registradas |
| Base de datos | MongoDB Atlas; métricas internas del cluster no registradas |
| Cuenta de prueba | Cuenta dedicada JMeter; contraseña no incluida |
| Límite de solicitudes local | `API_RATE_LIMIT_MAX=2000` durante las pruebas de rendimiento; posteriormente restaurado a 100 |
| Perfiles | 1 usuario / ramp-up 1 s / 60 s; 5 usuarios / 10 s / 120 s; 10 usuarios / 20 s / 120 s |
| Incidencias | Un intento anterior de línea base tuvo un HTTP 500 en health; la repetición y los perfiles de carga terminaron sin errores |

## Resultados

Estadísticas de los informes HTML de JMeter. `p90`, `p95` y `p99` corresponden a los campos de percentil de JMeter. Throughput en solicitudes por segundo.

| Escenario | Endpoint | Usuarios | Duración (s) | Muestras | Errores (# / %) | Throughput (req/s) | Media (ms) | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Línea base | GET `/api/health` | 1 | 60 | 24 | 0 / 0 % | 0.425 | 90.88 | 90 | 93 | 100.5 | 103 |
| Línea base | POST `/api/auth/login` | 1 | 60 | 24 | 0 / 0 % | 0.422 | 358.88 | 357 | 361 | 390.75 | 400 |
| Carga baja | GET `/api/health` | 5 | 120 | 219 | 0 / 0 % | 1.862 | 156.19 | 93 | 288 | 294 | 464 |
| Carga baja | POST `/api/auth/login` | 5 | 120 | 221 | 0 / 0 % | 1.855 | 471.92 | 492 | 563 | 587.8 | 752.04 |
| Carga moderada | GET `/api/health` | 10 | 120 | 352 | 0 / 0 % | 2.988 | 321.81 | 286 | 615.6 | 697 | 840.4 |
| Carga moderada | POST `/api/auth/login` | 10 | 120 | 357 | 0 / 0 % | 2.994 | 794.94 | 677 | 1354.6 | 1459.7 | 1551.56 |

### Resumen por ejecución

| Escenario | Muestras | Errores | Throughput total (req/s) | Media total (ms) | Mediana total (ms) | Mínimo (ms) | Máximo (ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Línea base | 48 | 0 (0 %) | 0.829 | 224.88 | 229 | 89 | 400 |
| Carga baja | 440 | 0 (0 %) | 3.694 | 314.78 | 355 | 88 | 1080 |
| Carga moderada | 709 | 0 (0 %) | 5.947 | 560.04 | 457 | 88 | 2292 |

## Artefactos

JTL con resultados por solicitud e informes HTML de las tres ejecuciones:

- Línea base: [`baseline-20261025-171053.jtl`](../performance/results/baseline-20261025-171053.jtl) y [`baseline-20261025-171053-html/`](../performance/results/baseline-20261025-171053-html/)
- Carga baja: [`low-20261025-171427.jtl`](../performance/results/low-20261025-171427.jtl) y [`low-20261025-171427-html/`](../performance/results/low-20261025-171427-html/)
- Carga moderada: [`moderate-20261025-172545.jtl`](../performance/results/moderate-20261025-172545.jtl) y [`moderate-20261025-172545-html/`](../performance/results/moderate-20261025-172545-html/)
- Incidencia del primer intento de línea base: [`baseline.jtl`](../performance/results/baseline.jtl) y [`baseline-html/`](../performance/results/baseline-html/)

## Comparación y hallazgos

- El throughput total observado aumentó de 0.829 req/s en línea base a 3.694 req/s con 5 usuarios y 5.947 req/s con 10 usuarios. Las tres ejecuciones comparativas registraron cero errores HTTP.
- La media total pasó de 224.88 ms en la línea base a 314.78 ms con 5 usuarios y 560.04 ms con 10 usuarios.
- Login fue la operación de mayor latencia en ambos escenarios concurrentes. Su media y p95 fueron 471.92 ms y 587.8 ms con 5 usuarios, y 794.94 ms y 1459.7 ms con 10 usuarios.
- Health también mostró latencias más altas bajo carga: media/p95 de 156.19/294 ms con 5 usuarios y 321.81/697 ms con 10 usuarios.
- El máximo total observado fue 2292 ms en la corrida de 10 usuarios. No hubo errores en ese JTL.
- El intento de línea base anterior tuvo un HTTP `500` en health que tardó 29,218 ms. Se conserva como incidencia; no se usa para comparar los tres escenarios válidos.

Estos datos describen únicamente estas ejecuciones. No establecen un umbral de aceptación, la capacidad máxima ni el comportamiento esperado en producción. JMeter por sí solo tampoco identifica la causa del aumento de latencia; se necesitarían logs y métricas de la aplicación y de Atlas para localizarla.

## Conclusiones y recomendaciones

Los tres perfiles quedaron ejecutados y comparables, y no registraron errores HTTP en sus archivos JTL. El incremento observado en las latencias, especialmente en login al pasar de 5 a 10 usuarios, es un hallazgo que se puede presentar y analizar con el equipo. Para atribuir causas, correlacionar los horarios con registros y métricas del servidor y de MongoDB.

Antes de entregar, verificar que el equipo pueda acceder a los JTL e informes HTML referenciados y registrar el commit exacto y las especificaciones del equipo generador si se requiere reproducibilidad. El límite local utilizado fue 2000 durante las pruebas y se restauró a 100 después; no se cambió el límite de producción.

## Limitaciones

- El plan representa una secuencia sintética de login y health autenticada; no cubre todos los endpoints ni reproduce toda la distribución real de tráfico.
- Los usuarios virtuales comparten una cuenta de prueba.
- El resultado depende de la máquina generadora, la red, la configuración y el estado de Atlas. No se registraron las especificaciones del hardware ni métricas internas de Atlas.
- El límite local configurado durante la prueba fue 2000; no se capturó evidencia independiente del encabezado de política cargado por el proceso para cada ejecución.
- El intento anterior con HTTP 500 queda documentado por separado; no se ocultó ni se mezcló con las mediciones sin errores.
