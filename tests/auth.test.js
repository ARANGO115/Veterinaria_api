jest.mock('../src/services/authService', () => ({
  loginUser: jest.fn()
}));

const request = require('supertest');
const app = require('../src/app');
const { loginUser } = require('../src/services/authService');

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('autentica al usuario y devuelve un token', async () => {
    loginUser.mockResolvedValue({
      token: 'jwt-token',
      user: {
        id: 'user-123',
        name: 'Ana Castro',
        email: 'ana@example.com'
      }
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'una-clave-segura' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token: 'jwt-token',
        user: {
          id: 'user-123',
          name: 'Ana Castro',
          email: 'ana@example.com'
        }
      }
    });
    expect(response.body.data.user.password).toBeUndefined();
    expect(loginUser).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'una-clave-segura'
    });
  });

  test('rechaza credenciales incorrectas', async () => {
    loginUser.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'incorrecta' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Correo electrónico o contraseña incorrectos'
    });
  });

  test.each([
    [{ password: 'una-clave-segura' }],
    [{ email: 'correo-inválido', password: 'una-clave-segura' }],
    [{ email: 'ana@example.com' }],
    [null]
  ])('rechaza datos inválidos: %p', async body => {
    const response = await request(app)
      .post('/api/auth/login')
      .send(body);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Datos inválidos');
    expect(loginUser).not.toHaveBeenCalled();
  });
});
