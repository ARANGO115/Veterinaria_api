const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Veterinaria API',
    version: '1.0.0',
    description: 'API REST para la gestión de usuarios, mascotas y citas veterinarias.'
  },
  servers: [{ url: '/', description: 'Servidor actual' }],
  tags: [
    { name: 'Autenticación' },
    { name: 'Salud' },
    { name: 'Mascotas' },
    { name: 'Citas' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'string' } }
        },
        required: ['success', 'message']
      },
      UserRegistration: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'Ana Castro' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          password: { type: 'string', minLength: 8, format: 'password', example: 'una-clave-segura' }
        }
      },
      Login: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          password: { type: 'string', format: 'password', example: 'una-clave-segura' }
        }
      },
      PetInput: {
        type: 'object',
        required: ['name', 'species'],
        properties: {
          name: { type: 'string', maxLength: 100, example: 'Luna' },
          species: { type: 'string', maxLength: 50, example: 'Perro' },
          breed: { type: 'string', maxLength: 100, example: 'Labrador' },
          age: { type: 'number', minimum: 0, example: 3 },
          gender: { type: 'string', maxLength: 20, example: 'Hembra' },
          weight: { type: 'number', minimum: 0, example: 12.5 },
          color: { type: 'string', maxLength: 50, example: 'Dorado' },
          birthDate: { type: 'string', format: 'date', example: '2023-01-15' },
          notes: { type: 'string', maxLength: 1000, example: 'Alérgica al pollo' }
        }
      },
      PetUpdate: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', maxLength: 100, example: 'Luna' },
          species: { type: 'string', maxLength: 50, example: 'Perro' },
          breed: { type: 'string', maxLength: 100, example: 'Labrador' },
          age: { type: 'number', minimum: 0, example: 3 },
          gender: { type: 'string', maxLength: 20, example: 'Hembra' },
          weight: { type: 'number', minimum: 0, example: 12.5 },
          color: { type: 'string', maxLength: 50, example: 'Dorado' },
          birthDate: { type: 'string', format: 'date', example: '2023-01-15' },
          notes: { type: 'string', maxLength: 1000, example: 'Alérgica al pollo' }
        }
      },
      AppointmentInput: {
        type: 'object',
        required: ['pet', 'date', 'time'],
        properties: {
          pet: { type: 'string', description: 'ID de una mascota propia', example: '507f1f77bcf86cd799439011' },
          date: { type: 'string', format: 'date', example: '2027-01-15' },
          time: { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', example: '14:30' }
        }
      },
      RescheduleInput: {
        type: 'object',
        required: ['date', 'time'],
        properties: {
          date: { type: 'string', format: 'date', example: '2027-01-15' },
          time: { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', example: '15:30' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar usuario',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRegistration' } } }
        },
        responses: {
          201: { description: 'Usuario registrado' },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'El correo ya está registrado' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión y obtener un JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } }
        },
        responses: {
          200: { description: 'Autenticación exitosa; devuelve el token JWT' },
          400: { description: 'Datos inválidos' },
          401: { description: 'Credenciales incorrectas' }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Salud'],
        summary: 'Verificar el estado de la API',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'API activa' },
          401: { description: 'Token ausente o inválido' }
        }
      }
    },
    '/api/pets': {
      post: {
        tags: ['Mascotas'],
        summary: 'Registrar mascota',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PetInput' } } }
        },
        responses: {
          201: { description: 'Mascota registrada' },
          400: { description: 'Datos inválidos' },
          401: { description: 'Token ausente o inválido' }
        }
      },
      get: {
        tags: ['Mascotas'],
        summary: 'Listar mascotas del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de mascotas' },
          401: { description: 'Token ausente o inválido' }
        }
      }
    },
    '/api/pets/{id}': {
      parameters: [{
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID de la mascota'
      }],
      get: {
        tags: ['Mascotas'],
        summary: 'Consultar una mascota propia',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Mascota encontrada' },
          401: { description: 'Token ausente o inválido' },
          404: { description: 'Mascota no encontrada' }
        }
      },
      put: {
        tags: ['Mascotas'],
        summary: 'Actualizar una mascota propia',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PetUpdate' }
            }
          }
        },
        responses: {
          200: { description: 'Mascota actualizada' },
          400: { description: 'Datos inválidos' },
          401: { description: 'Token ausente o inválido' },
          404: { description: 'Mascota no encontrada' }
        }
      }
    },
    '/api/appointments': {
      post: {
        tags: ['Citas'],
        summary: 'Agendar cita para una mascota propia',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AppointmentInput' } } }
        },
        responses: {
          201: { description: 'Cita agendada' },
          400: { description: 'Fecha, hora o datos inválidos' },
          401: { description: 'Token ausente o inválido' },
          403: { description: 'La mascota no pertenece al usuario' },
          404: { description: 'Mascota no encontrada' }
        }
      },
      get: {
        tags: ['Citas'],
        summary: 'Listar citas de las mascotas del usuario',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de citas' },
          401: { description: 'Token ausente o inválido' }
        }
      }
    },
    '/api/appointments/{id}': {
      parameters: [{
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID de la cita'
      }],
      get: {
        tags: ['Citas'],
        summary: 'Consultar una cita propia',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Cita encontrada' },
          400: { description: 'ID inválido' },
          401: { description: 'Token ausente o inválido' },
          404: { description: 'Cita no encontrada' }
        }
      }
    },
    '/api/appointments/{id}/reschedule': {
      parameters: [{
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID de la cita'
      }],
      patch: {
        tags: ['Citas'],
        summary: 'Reprogramar una cita propia',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RescheduleInput' } } }
        },
        responses: {
          200: { description: 'Cita reprogramada' },
          400: { description: 'Fecha, hora o estado de cita inválidos' },
          401: { description: 'Token ausente o inválido' },
          404: { description: 'Cita no encontrada' }
        }
      }
    },
    '/api/appointments/{id}/cancel': {
      parameters: [{
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID de la cita'
      }],
      patch: {
        tags: ['Citas'],
        summary: 'Cancelar una cita propia',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Cita cancelada' },
          400: { description: 'La cita ya estaba cancelada' },
          401: { description: 'Token ausente o inválido' },
          404: { description: 'Cita no encontrada' }
        }
      }
    }
  }
};

module.exports = openApiDocument;
