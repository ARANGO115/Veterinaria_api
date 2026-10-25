const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

describe('GET /api/health', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'secreto-de-prueba';
  });

  test('rechaza solicitudes sin token', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Se requiere un token de autenticación'
    });
  });

  test('rechaza solicitudes con un token inválido', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Authorization', 'Bearer token-invalido');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
  });

  test('rechaza un esquema de autorización distinto de Bearer', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Authorization', 'Basic token');

    expect(response.statusCode).toBe(401);
  });

  test('responde correctamente con un token válido', async () => {
    const token = jwt.sign({ sub: 'usuario123' }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    const response = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Veterinaria API funcionando correctamente'
    });
  });
});
