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
