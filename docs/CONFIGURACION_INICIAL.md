# Configuración Inicial - Veterinaria API

## 1. Objetivo

Documentar la configuración inicial de Veterinaria API para que los integrantes del equipo puedan preparar el entorno de desarrollo, instalar las dependencias y ejecutar el proyecto correctamente.

## 2. Requisitos previos

- Node.js instalado.
- npm, incluido con Node.js.
- Git para obtener y actualizar el código fuente.
- Acceso a MongoDB Atlas.
- Una base de datos MongoDB disponible para la aplicación.

Se recomienda utilizar una versión de Node.js compatible con las dependencias definidas en `package.json`.

## 3. Instalación del proyecto

Clonar el repositorio:

```bash
git clone https://github.com/ARANGO115/Veterinaria_api.git
cd Veterinaria_api
```

Instalar las dependencias:

```bash
npm install
```

Este comando instala las dependencias definidas en `package.json`.

## 4. Configuración de variables de entorno

El proyecto utiliza variables de entorno para configurar el servidor, la conexión con MongoDB y la autenticación mediante JWT.

Utilizar `.env.example` como referencia y crear el archivo de entorno local correspondiente.

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://NOMBRE_DE_USUARIO:CONTRASENA@HOST_DE_ATLAS.mongodb.net/veterinaria
JWT_SECRET=CAMBIAR_POR_UN_SECRETO_SEGURO
JWT_EXPIRES_IN=1h
```

No se deben publicar contraseñas, cadenas de conexión reales, claves JWT ni otros secretos en el repositorio.

## 5. Ejecución de la aplicación

Para ejecutar la aplicación:

```bash
npm start
```

Para ejecutar el proyecto durante el desarrollo con Nodemon:

```bash
npm run dev
```

La aplicación utiliza el puerto definido mediante `PORT`. El valor configurado actualmente es `3000`.

## 6. Ejecución de pruebas

Las pruebas automatizadas se ejecutan mediante:

```bash
npm test
```

Para ejecutar Jest en modo observación:

```bash
npm run test:watch
```

Actualmente el repositorio cuenta con pruebas para el endpoint de salud de la API.

## 7. Estructura básica del proyecto

```text
Veterinaria_api/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── tests/
│   └── health.test.js
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
├── package-lock.json
├── README.md
└── docs/
    └── CONFIGURACION_INICIAL.md
```

### Principales responsabilidades

- `config/`: configuración de servicios externos, como la conexión con MongoDB.
- `controllers/`: gestionan las solicitudes HTTP.
- `middlewares/`: funciones intermedias para autenticación, validación y manejo de errores.
- `models/`: modelos utilizados para representar los datos de la aplicación.
- `routes/`: definición de las rutas y endpoints.
- `services/`: lógica de negocio de la aplicación.
- `utils/`: funciones y utilidades reutilizables.
- `validators/`: validaciones de los datos recibidos.
- `app.js`: configuración principal de Express.
- `server.js`: punto de entrada para iniciar el servidor.
- `tests/`: pruebas automatizadas del proyecto.

## 8. Flujo básico de trabajo del equipo

Actualizar primero la rama `develop`:

```bash
git switch develop
git pull origin develop
```

Crear una rama específica para la tarea:

```bash
git switch -c NOMBRE-DE-LA-RAMA
```

Durante el desarrollo se deben realizar cambios relacionados únicamente con la tarea asignada.

Antes de subir los cambios, ejecutar las pruebas:

```bash
npm test
```

Guardar los cambios:

```bash
git add .
git commit -m "Descripción del cambio"
```

Subir la rama al repositorio:

```bash
git push -u origin NOMBRE-DE-LA-RAMA
```

Después se crea un Pull Request hacia `develop` para revisión e integración.

## 9. Recomendaciones de seguridad

- No subir archivos `.env` con credenciales reales.
- Utilizar `.env.example` para documentar las variables necesarias.
- No publicar contraseñas de MongoDB Atlas.
- No publicar el secreto utilizado para firmar los tokens JWT.
- Mantener las credenciales reales únicamente en el entorno local o en un mecanismo seguro de configuración.

## 10. Resumen

Con estos pasos, cualquier integrante del equipo puede obtener el proyecto, instalar sus dependencias, configurar las variables de entorno, ejecutar la API y ejecutar las pruebas automatizadas sin necesidad de conocer previamente la configuración del proyecto.
