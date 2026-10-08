const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  test('debe responder correctamente', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});