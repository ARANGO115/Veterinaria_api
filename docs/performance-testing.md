# Pruebas de rendimiento con Apache JMeter

## Alcance

El plan `performance/apache-jmeter/veterinaria-api.jmx` ejercita estos endpoints reales:

| Endpoint          | Método | Propósito |
| --- | ---       |-|
| `/api/health`     | GET    | Medir la respuesta básica del servicio, sin modificar datos. |
| `/api/auth/login` | POST   | Medir autenticación y consulta/verificación del usuario en MongoDB. |

No se incluye `POST /api/auth/register`: cada solicitud crea datos persistentes y sus resultados dependen del estado previo de la base de datos. El plan envía credenciales de una cuenta de prueba ya existente; no incluye credenciales reales ni crea usuarios.

## Condiciones y seguridad

- Ejecutar solo contra una instancia propia o expresamente autorizada, preferiblemente un entorno de prueba aislado.
- Verificar que la API apunta a una base de datos de prueba y que el usuario configurado es de prueba.
- No usar producción ni credenciales personales. No guardar secretos en el repositorio, archivos JMX, resultados JTL o capturas.
- El destino predeterminado es `http://127.0.0.1:3000`. Sobrescribirlo solo con el host autorizado.
- El plan espera 1 segundo antes de cada solicitud y repite una pareja (salud y login) durante la duración configurada. Con 10 usuarios, el ritmo máximo teórico es aproximadamente 5 solicitudes por segundo en total; la latencia real lo reduce. Detener la prueba si afecta al entorno.
- Cada endpoint comprueba que la respuesta HTTP sea `200`, para que respuestas como `401`, `429` o `5xx` se contabilicen como errores.
- Las pruebas no imponen umbrales de rendimiento. Registrar las métricas observadas y compararlas entre ejecuciones equivalentes.

## Escenarios propuestos

Cada escenario se ejecuta por separado, en modo no gráfico, con la misma cuenta de prueba y el mismo entorno. Los valores son niveles iniciales de observación, no criterios de aprobación ni capacidad esperada:

| Escenario      | Usuarios virtuales| Ramp-up | Duración |
| ---            | ---:              | ---:    | ---:     |
| Línea base     | 1                 | 1 s     | 60 s     |
| Carga baja     | 5                 | 10 s    | 120 s    |
| Carga moderada | 10                | 20 s    | 120 s    |

Solo aumentar la carga después de revisar el resultado y confirmar que el entorno se mantiene estable. No extrapolar estos datos a capacidad de producción.

## Requisitos previos

1. Instalar Apache JMeter 5.6.3 y Java. Si Java no se detecta automáticamente, definir `JAVA_HOME` a la carpeta de instalación antes de ejecutar JMeter.
2. Iniciar la API con la configuración de base de datos del entorno controlado y confirmar que `GET /api/health` responde.
3. Crear previamente una cuenta dedicada de prueba y comprobar que puede iniciar sesión.
4. Configurar las variables locales `JMETER_LOGIN_EMAIL` y `JMETER_LOGIN_PASSWORD` para la cuenta de aplicación de prueba. El plan las lee del entorno del proceso; no se pasan como argumentos `-J` ni se guardan en el `.jmx`. No compartas la contraseña. El usuario de base de datos de Atlas no sustituye la cuenta de aplicación que se autentica en `/api/auth/login`.
5. Crear una carpeta local para los artefactos de ejecución:

```powershell
New-Item -ItemType Directory -Force .\performance\results | Out-Null
```

Si la API no conecta con Atlas, verifica que el cluster esté activo, que la IP pública actual esté permitida en **Security > Network Access** y que el usuario de base de datos y la cadena de conexión correspondan al cluster. No desactives TLS para sortear errores de conexión.

## Ejecución

Desde la raíz del repositorio, cargar las credenciales de prueba en variables de entorno de la sesión PowerShell (sin escribirlas en la línea de comandos ni en el historial) y ajustar los parámetros del perfil:

```powershell
# Alternativa A: solicitar las credenciales sin incluirlas en el historial.
$env:JMETER_LOGIN_EMAIL = Read-Host 'Correo de la cuenta de prueba de la API'
$securePassword = Read-Host 'Contraseña de la cuenta de prueba de la API' -AsSecureString
$env:JMETER_LOGIN_PASSWORD = [System.Net.NetworkCredential]::new('', $securePassword).Password

# Alternativa B: cargar performance\.env.local, archivo local ignorado por Git:
# JMETER_LOGIN_EMAIL=...
# JMETER_LOGIN_PASSWORD=...
# Get-Content .\performance\.env.local | ForEach-Object {
#   if ($_ -match '^\s*(JMETER_LOGIN_EMAIL|JMETER_LOGIN_PASSWORD)=(.*)$') {
#     [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
#   }
# }

$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jre-17.0.20.101-hotspot'
$env:PATH = "$env:JAVA_HOME\bin;C:\Users\Jhoan\AppData\Local\Programs\JMeter\bin;$env:PATH"

jmeter -n `
  -t .\performance\apache-jmeter\veterinaria-api.jmx `
  -Jhost=127.0.0.1 -Jport=3000 -Jprotocol=http `
  -Jusers=1 -Jrampup=1 -Jduration=60 `
  -l .\performance\results\baseline.jtl `
  -e -o .\performance\results\baseline-html

Remove-Item Env:JMETER_LOGIN_EMAIL, Env:JMETER_LOGIN_PASSWORD
Remove-Variable securePassword -ErrorAction SilentlyContinue
```

Repetir cambiando `users`, `rampup`, `duration` y usando un nombre de salida distinto por escenario, por ejemplo `low.jtl`/`low-html` y `moderate.jtl`/`moderate-html`. Cada carpeta HTML debe ser nueva o estar vacía. No versionar resultados con datos sensibles.

Para inspeccionar el plan en la interfaz gráfica, abrir el `.jmx`; las ejecuciones comparables deben realizarse en modo no gráfico para reducir la carga del generador. Si se usa un host distinto, el esquema HTTPS y el puerto deben corresponder a la instancia autorizada.

## Métricas y análisis

Conservar el `.jtl` de cada ejecución y el informe HTML de JMeter. Para cada endpoint y escenario registrar:

- total de muestras y solicitudes por segundo (throughput);
- tasa y número de errores;
- latencia media, mediana y percentiles 90, 95 y 99;
- usuarios configurados, ramp-up, duración, versión de API/JMeter/Java, fecha y entorno.

Comparar los escenarios con la misma configuración, credenciales y estado de entorno. Revisar códigos HTTP, errores de conexión, latencias crecientes y diferencias entre salud y login. Un aumento en login puede involucrar MongoDB y verificación de contraseñas; las métricas de JMeter por sí solas no identifican la causa raíz. Correlacionar con métricas y registros del servidor y de MongoDB antes de recomendar cambios.

## Limitaciones

- El plan mide el comportamiento de una secuencia sintética de salud y login, no representa todas las operaciones ni la distribución real de tráfico.
- Todos los usuarios virtuales usan la misma cuenta dedicada; el escenario no mide creación de cuentas ni diversidad de usuarios.
- El resultado depende de la máquina generadora, red, base de datos, configuración y datos disponibles.
- El plan no configura límites de aceptación. Conclusiones y recomendaciones deben basarse en resultados JTL reales.
