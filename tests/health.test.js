jest.mock('../src/models/User', () => ({
  findById: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const app = require('../src/app');

const userId = '507f1f77bcf86cd799439011';

describe('GET /api/health', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'secreto-de-prueba';
  });

  beforeEach(() => {
    User.findById.mockResolvedValue({ _id: userId });
  });

  const createToken = (payload, options) => jwt.sign(
    payload,
    process.env.JWT_SECRET,
    options
  );

  test('rechaza solicitudes sin token', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Se requiere un token de autenticación'
    });
    expect(User.findById).not.toHaveBeenCalled();
  });

  test.each(['Token inválido', 'Bearer'])(
    'rechaza un encabezado de autorización mal formado: %s',
    async authorization => {
      const response = await request(app)
        .get('/api/health')
        .set('Authorization', authorization);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(User.findById).not.toHaveBeenCalled();
    }
  );

  test('rechaza solicitudes con un token inválido', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Authorization', 'Bearer no-es-un-jwt');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
    expect(User.findById).not.toHaveBeenCalled();
  });

  test('rechaza solicitudes con un token expirado', async () => {
    const token = createToken({ sub: userId }, { expiresIn: '-1s' });

    const response = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(User.findById).not.toHaveBeenCalled();
  });

  test('responde correctamente con un token válido y usuario existente', async () => {
    const token = createToken({ sub: userId }, { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(User.findById).toHaveBeenCalledWith(userId);
  });

  test('rechaza un token válido cuando el usuario ya no existe', async () => {
    User.findById.mockResolvedValue(null);
    const token = createToken({ sub: userId }, { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
  });

  test('comunica los errores de base de datos como error interno', async () => {
    User.findById.mockRejectedValue(new Error('fallo interno de base de datos'));
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    const token = createToken({ sub: userId }, { expiresIn: '1h' });

    try {
      const response = await request(app)
        .get('/api/health')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Ocurrió un error interno'
      });
      expect(JSON.stringify(response.body)).not.toContain('fallo interno');
    } finally {
      errorLog.mockRestore();
    }
  });
});
