# Informe de pruebas de rendimiento

## Estado

La API inició en el puerto `4500` y se conectó a Atlas. La solicitud manual sin token a `GET /api/health` respondió `401`, coherente con el middleware de autenticación actual. JMeter se validó para extraer el token del login y enviarlo al endpoint protegido, pero no se ejecutó carga. Aún no se generaron archivos JTL ni métricas de rendimiento; no se presentan resultados ni conclusiones inventados.

## Objetivo y alcance

Evaluar `/api/health` y `/api/auth/login` bajo los escenarios documentados en [Pruebas de rendimiento con Apache JMeter](./performance-testing.md), en un entorno controlado y autorizado.

## Condiciones de ejecución

Completar con datos de la ejecución:

| Dato | Valor |
| --- | --- |
| Fecha y zona horaria | Pendiente |
| Entorno / URL (sin secretos) | Pendiente |
| Versión o commit de la API | Pendiente |
| Versión de JMeter y Java | Pendiente |
| Configuración de máquina generadora | Pendiente |
| Configuración relevante de MongoDB | Pendiente |
| Cuenta de prueba (identificador no sensible) | Pendiente |
| Incidencias o cambios durante la prueba | Pendiente de documentar durante la ejecución de carga. |

## Resultados

Completar desde los archivos `.jtl` y los informes HTML generados por JMeter. Mantener una fila por endpoint y escenario; no estimar valores ausentes.

| Escenario | Endpoint | Usuarios | Duración (s) | Muestras | Errores (%) | Throughput (req/s) | Media (ms) | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Línea base | GET `/api/health` | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Línea base | POST `/api/auth/login` | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Carga baja | GET `/api/health` | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Carga baja | POST `/api/auth/login` | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Carga moderada | GET `/api/health` | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Carga moderada | POST `/api/auth/login` | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

Archivos de resultados JTL: pendientes. Informes HTML: pendientes.

## Comparación y hallazgos

Pendiente de ejecución y análisis de las métricas obtenidas. Identificar el escenario y endpoint para cada hallazgo, adjuntar evidencia y distinguir observaciones de hipótesis.

## Conclusiones y recomendaciones

Pendiente de resultados reales. No establecer límites de rendimiento arbitrarios ni atribuir una causa raíz sin evidencia correlacionada.

## Limitaciones

La prueba de carga aún requiere una cuenta dedicada de la aplicación para el endpoint de login, configurada localmente y sin compartir secretos. El usuario de MongoDB Atlas no es la cuenta de login de la aplicación. La ruta de salud exige autenticación y el plan usa el token devuelto por el login. No se desactivó TLS. Aplican también las limitaciones de representatividad y dependencia del entorno descritas en la guía de ejecución. Documentar cualquier desviación del perfil propuesto o interrupción que afecte la comparación.
