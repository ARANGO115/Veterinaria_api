jest.mock('../src/services/authService', () => ({
  registerUser: jest.fn()
}));

const request = require('supertest');
const app = require('../src/app');
const { registerUser } = require('../src/services/authService');

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registra un usuario y confirma el resultado', async () => {
    registerUser.mockResolvedValue({
      id: 'user-123',
      name: 'Ana Castro',
      email: 'ana@example.com'
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ana Castro',
        email: 'ana@example.com',
        password: 'una-clave-segura'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        id: 'user-123',
        name: 'Ana Castro',
        email: 'ana@example.com'
      }
    });
    expect(response.body.data.password).toBeUndefined();
    expect(registerUser).toHaveBeenCalledWith({
      name: 'Ana Castro',
      email: 'ana@example.com',
      password: 'una-clave-segura'
    });
  });

  test.each([
    [{ email: 'ana@example.com', password: 'una-clave-segura' }],
    [{ name: 'Ana Castro', password: 'una-clave-segura' }],
    [{ name: 'Ana Castro', email: 'correo-inválido', password: 'una-clave-segura' }],
    [{ name: 'Ana Castro', email: 'ana@example.com', password: 'corta' }],
    [null]
  ])('rechaza datos inválidos: %p', async body => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(body);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos inválidos');
    expect(registerUser).not.toHaveBeenCalled();
  });

  test('informa cuando el correo ya está registrado', async () => {
    registerUser.mockRejectedValue({ code: 11000 });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ana Castro',
        email: 'ana@example.com',
        password: 'una-clave-segura'
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
  });
});
