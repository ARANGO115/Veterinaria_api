jest.mock('../src/services/authService', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn()
}));

const request = require('supertest');
const app = require('../src/app');
const { registerUser, loginUser } = require('../src/services/authService');

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registra al usuario y confirma el resultado', async () => {
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

  test('rechaza un correo electrónico ya registrado', async () => {
    registerUser.mockRejectedValue({ code: 11000 });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ana Castro',
        email: 'ana@example.com',
        password: 'una-clave-segura'
      });

    expect(response.statusCode).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: 'Ya existe un usuario registrado con ese correo electrónico'
    });
  });
});

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
