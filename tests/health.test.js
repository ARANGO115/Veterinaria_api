const request = require('supertest');
const app = require('../src/app');

describe('Integración - GET /api/health', () => {
  test('debe responder correctamente cuando la API está disponible', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Veterinaria API funcionando correctamente'
    });
  });

  test('debe retornar 404 cuando el endpoint no existe', async () => {
    const response = await request(app).get('/api/endpoint-inexistente');

    expect(response.statusCode).toBe(404);
  });
});