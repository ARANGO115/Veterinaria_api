# SDGV-47 — Validación y documentación del pipeline de CI

## 1. Objetivo

Validar y documentar el funcionamiento del pipeline de integración continua (CI) del backend de Veterinaria API mediante GitHub Actions, comprobando la ejecución de las pruebas automatizadas con Jest y las pruebas de API con Newman.

La validación contempla la ejecución correcta de las pruebas, la generación y conservación de resultados, el tratamiento de errores y la configuración necesaria para ejecutar el pipeline.

## 2. Ubicación del workflow

El workflow se encuentra en:

`.github/workflows/backend-ci.yml`

El nombre del workflow es `Backend CI` y el trabajo principal se identifica como `Jest y Newman`.

## 3. Eventos que activan el pipeline

El workflow está configurado para ejecutarse mediante los siguientes eventos:

- **Push:** a las ramas `develop`, `SDGV-46-configurar-el-pipeline-de-ci-con-git-hub-actions` y `SDGV-47-validar-y-documentar-el-funcionamiento-del-pipeline`.
- **Pull request:** dirigido a la rama `develop`.
- **Ejecución manual:** mediante `workflow_dispatch` en GitHub Actions.

## 4. Requisitos y configuración

El entorno de integración continua utiliza:

- Ubuntu como sistema operativo del runner.
- Node.js 22.
- Instalación de dependencias mediante `npm ci`.
- MongoDB 7.0 como servicio de base de datos para las pruebas.
- Jest para las pruebas automatizadas del backend.
- Newman para ejecutar la colección de Postman.
- Una colección ubicada en `postman/veterinaria-auth.postman_collection.json`.

Las variables de entorno utilizadas en CI incluyen:

| Variable | Propósito |
|---|---|
| `NODE_ENV` | Establece el entorno de ejecución de pruebas. |
| `PORT` | Define el puerto del backend: 3000. |
| `MONGODB_URI` | Conecta con la base de datos de pruebas de MongoDB. |
| `JWT_SECRET` | Proporciona una clave de prueba para la autenticación. |
| `JWT_EXPIRES_IN` | Define la duración del token JWT. |
| `POSTMAN_COLLECTION` | Identifica la colección de Postman que ejecuta Newman. |

La configuración de CI utiliza una base de datos local de pruebas y una clave JWT exclusiva para el entorno de pruebas. No necesita utilizar las credenciales de una base de datos de producción.

## 5. Procedimiento de ejecución

El workflow realiza los siguientes pasos:

1. Descarga el repositorio mediante `actions/checkout`.
2. Configura Node.js 22 mediante `actions/setup-node`.
3. Instala las dependencias con `npm ci`.
4. Ejecuta las pruebas automatizadas con `npm test`.
5. Comprueba que la colección de Postman exista, no esté vacía y contenga JSON válido.
6. Inicia el backend y comprueba que responda.
7. Ejecuta Newman contra el backend utilizando la colección configurada.
8. Intenta conservar el informe XML de Newman como artefacto, incluso si una etapa anterior falla.

El servicio MongoDB cuenta con una comprobación de salud para que el pipeline pueda verificar su disponibilidad.

## 6. Resultados de las pruebas de Jest

Durante la validación local se ejecutó:

`npm test`

El resultado obtenido fue:

- Suites aprobadas: 12 de 12.
- Pruebas aprobadas: 66 de 66.
- Pruebas fallidas: 0.
- Tiempo de ejecución observado: 2,766 segundos.

Por lo tanto, las pruebas automatizadas de Jest finalizaron correctamente.

Durante la ejecución se observaron mensajes de consola relacionados con la carga de variables de entorno mediante `dotenv`. Estos mensajes no impidieron la aprobación de las pruebas.

## 7. Resultados de las pruebas de Newman

También se revisó el informe XML generado por Newman en una ejecución del pipeline.

Resultados registrados:

- Suites de Newman: 5.
- Aserciones contabilizadas: 11.
- Fallos: 0.
- Errores: 0.
- Tiempo registrado: 1,018 segundos.

La colección validó los siguientes escenarios:

1. Registro de un usuario de prueba.
2. Inicio de sesión con el usuario registrado.
3. Acceso a una ruta protegida con un token válido.
4. Rechazo del acceso cuando no se proporciona un token.
5. Rechazo de credenciales incorrectas.

Estos resultados corresponden al informe XML revisado. No deben interpretarse como una nueva ejecución de Newman en cada validación local.

## 8. Comportamiento ante fallos

Se realizó una prueba controlada local con una aserción intencionalmente incorrecta:

`expect(1).toBe(2)`

Jest identificó la prueba como fallida y devolvió el código de salida `1`, como se esperaba.

El archivo temporal se creó dentro de `tests` y se eliminó después de la ejecución.

Esta comprobación demuestra que Jest detecta errores y devuelve un código de salida distinto de cero. Por sí sola, no demuestra que se haya observado una ejecución fallida de GitHub Actions. Para documentar ese comportamiento remoto debe revisarse una ejecución controlada en GitHub Actions o verificarse la propagación del código de salida en el workflow.

En el workflow actual, las etapas de Jest y Newman utilizan comandos que deben finalizar correctamente para que el trabajo continúe o termine como aprobado. Si una prueba devuelve un código de salida distinto de cero, GitHub Actions debe marcar el paso correspondiente como fallido.

## 9. Informes y evidencias

El workflow intenta conservar el informe XML de Newman con el nombre de artefacto:

`newman-results`

El artefacto tiene una retención configurada de siete días. El paso de carga utiliza `if: always()` para intentar ejecutarse incluso cuando los pasos anteriores fallan. Si el informe no existe, la configuración permite ignorar su ausencia.

Como evidencias de la validación se dispone de:

- Resultado local de Jest con 12 suites y 66 pruebas aprobadas.
- Informe XML de Newman con cinco suites, once aserciones y cero fallos.
- Resultado de la prueba controlada que demuestra que Jest devuelve un código de salida `1` ante una aserción incorrecta.
- Estado de Git que identifica la modificación del workflow para incluir la rama SDGV-47.

Para completar las evidencias remotas, debe conservarse también el enlace o la captura de la ejecución aprobada de GitHub Actions y, si se realiza, de la ejecución controlada fallida.

## 10. Seguridad de los logs

La configuración de CI utiliza una clave JWT de prueba y una base de datos destinada a las pruebas.

Se deben mantener las siguientes precauciones:

- No incluir contraseñas, tokens reales ni cadenas de conexión de producción en el repositorio.
- No imprimir variables sensibles en los logs.
- No subir archivos `.env` ni credenciales como artefactos.
- Revisar los registros del servidor antes de imprimirlos en los logs del pipeline.
- Utilizar secretos de GitHub cuando una integración necesite credenciales reales.

La clave configurada en el workflow debe utilizarse únicamente para pruebas y nunca para un entorno productivo.

## 11. Ejecución local

Para ejecutar las pruebas automatizadas:

```powershell
npm ci
npm test
```

Para ejecutar la colección de Newman contra un backend local que ya esté iniciado y respondiendo:

```powershell
npx newman run postman/veterinaria-auth.postman_collection.json --env-var "baseUrl=http://127.0.0.1:3000"
```

El puerto utilizado en el comando debe coincidir con el puerto donde está escuchando el backend.

Para ejecutar el pipeline completo en GitHub, se puede utilizar un `push` a una rama configurada o iniciar el workflow manualmente desde la pestaña **Actions**, siempre que el workflow esté disponible en la rama y la configuración de GitHub lo permita.

## 12. Alcance y conclusión

La validación realizada confirma que las pruebas locales de Jest finalizan correctamente, que Jest detecta una aserción incorrecta y que se dispone de un informe XML de Newman sin fallos para una ejecución revisada del pipeline.

La revisión de la ejecución de GitHub Actions permite completar la evidencia de que ambos conjuntos de pruebas se ejecutan en CI.

La validación no incluye pruebas de rendimiento con JMeter ni mediciones de carga, ya que están fuera del alcance de SDGV-47.

Antes de cerrar la tarea, se deben verificar los resultados finales del workflow en GitHub, conservar las evidencias y confirmar que los cambios de documentación y configuración estén incluidos en la rama correspondiente.