jest.mock('../src/services/authService', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn().mockResolvedValue(null)
}));

const request = require('supertest');
const app = require('../src/app');

describe('Límite de solicitudes de rutas de autenticación', () => {
  test('limita solicitudes repetidas a rutas públicas de autenticación', async () => {
    const responses = [];

    for (let attempt = 0; attempt < 110; attempt += 1) {
      responses.push(await request(app)
        .post('/api/auth/login')
        .send({ email: 'ana@example.com', password: 'incorrecta' }));
    }

    expect(responses.some(response => response.statusCode === 429)).toBe(true);
    const limitedResponse = responses.find(response => response.statusCode === 429);
    expect(limitedResponse.body).toEqual({
      success: false,
      message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
    });
  });

  test('permite configurar un límite específico para el entorno de prueba', async () => {
    const originalLimit = process.env.API_RATE_LIMIT_MAX;
    process.env.API_RATE_LIMIT_MAX = '2';
    jest.resetModules();

    try {
      const configuredApp = require('../src/app');
      const responses = [];

      for (let attempt = 0; attempt < 3; attempt += 1) {
        responses.push(await request(configuredApp)
          .post('/api/auth/login')
          .send({ email: 'ana@example.com', password: 'incorrecta' }));
      }

      expect(responses.map(response => response.statusCode)).toEqual([401, 401, 429]);
    } finally {
      if (originalLimit === undefined) {
        delete process.env.API_RATE_LIMIT_MAX;
      } else {
        process.env.API_RATE_LIMIT_MAX = originalLimit;
      }
      jest.resetModules();
    }
  });
});
