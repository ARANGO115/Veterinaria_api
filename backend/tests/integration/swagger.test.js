const request = require('supertest');
const app = require('../../src/app');

describe('Documentación Swagger', () => {
  test('sirve el documento OpenAPI', async () => {
    const response = await request(app)
      .get('/api-docs.json')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths).toHaveProperty('/api/pets');
    expect(response.body.paths).toHaveProperty('/api/appointments/{id}/cancel');
  });

  test('sirve Swagger UI', async () => {
    const response = await request(app)
      .get('/api-docs/')
      .expect(200)
      .expect('Content-Type', /html/);

    expect(response.text).toContain('swagger-ui');
  });
});
