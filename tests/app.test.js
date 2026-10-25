const request = require('supertest');

describe('Aplicación Express', () => {
test('responde 404 cuando se solicita una ruta inexistente', async () => {
const app = require('../src/app');

const response = await request(app)
  .get('/ruta-que-no-existe')
  .expect(404);

expect(response.body).toEqual({
  success: false,
  message: 'Ruta /ruta-que-no-existe no encontrada'
});

});

test('maneja errores cuando se envía JSON malformado', async () => {
const app = require('../src/app');

const response = await request(app)
  .post('/api/auth/login')
  .set('Content-Type', 'application/json')
  .send('{"email":')
  .expect(400);

expect(response.body).toHaveProperty('success', false);
expect(response.body).toHaveProperty('message');

});

test('registra solicitudes cuando el entorno no es test', async () => {
const entornoOriginal = process.env.NODE_ENV;

jest.resetModules();

jest.doMock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

try {
  process.env.NODE_ENV = 'development';

  const app = require('../src/app');
  const logger = require('../src/utils/logger');

  await request(app)
    .get('/ruta-para-probar-logs')
    .expect(404);

  expect(logger.info).toHaveBeenCalled();
} finally {
  jest.dontMock('../src/utils/logger');
  jest.resetModules();

  if (entornoOriginal === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = entornoOriginal;
  }
}

});
});