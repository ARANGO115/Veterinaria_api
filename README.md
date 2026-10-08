# Veterinaria API

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
