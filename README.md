# Veterinaria API

## Registro de usuarios

`POST /api/auth/register` permite crear una cuenta. Envía un objeto JSON con:

```json
{
  "name": "Ana Castro",
  "email": "ana@example.com",
  "password": "una-clave-segura"
}
```

El nombre debe tener al menos 2 caracteres, el correo debe ser válido y la
contraseña debe tener al menos 8 caracteres. La API responde con `201` cuando
el registro se completa, `400` ante datos inválidos y `409` si el correo ya
está registrado. La contraseña se guarda como hash y no se incluye en la
respuesta.

## Inicio de sesión

`POST /api/auth/login` recibe las credenciales de un usuario registrado:

```json
{
  "email": "ana@example.com",
  "password": "una-clave-segura"
}
```

Al autenticar correctamente responde con `200`, los datos públicos del usuario
y un token JWT. Las credenciales incorrectas responden con `401`; los datos
inválidos responden con `400`. Configura `JWT_SECRET` y, opcionalmente,
`JWT_EXPIRES_IN` en el archivo de entorno.
