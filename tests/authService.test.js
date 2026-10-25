jest.mock('../src/models/User', () => {
  const User = jest.fn();
  User.findOne = jest.fn();
  return User;
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const { registerUser, loginUser } = require('../src/services/authService');

describe('Servicio de autenticación', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'secreto-de-prueba';
    jest.clearAllMocks();
  });

  test('el registro solo persiste los campos permitidos, no el rol del cliente', async () => {
    const save = jest.fn().mockResolvedValue();
    User.mockImplementation(function createUser(values) {
      Object.assign(this, values);
      this.id = 'user-123';
      this.save = save;
    });

    const result = await registerUser({
      name: 'Ana Castro',
      email: 'ana@example.com',
      password: 'una-clave-segura',
      role: 'admin'
    });

    expect(User).toHaveBeenCalledWith({
      name: 'Ana Castro',
      email: 'ana@example.com',
      password: 'una-clave-segura'
    });
    expect(save).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'user-123',
      name: 'Ana Castro',
      email: 'ana@example.com'
    });
    expect(result).not.toHaveProperty('role');
    expect(result).not.toHaveProperty('password');
  });

  test('autentica una contraseña válida y emite un JWT para el usuario', async () => {
    const password = 'una-clave-segura';
    const userId = '507f1f77bcf86cd799439011';
    const user = {
      id: userId,
      name: 'Ana Castro',
      email: 'ana@example.com',
      password: await bcrypt.hash(password, 4)
    };
    const select = jest.fn().mockResolvedValue(user);
    User.findOne.mockReturnValue({ select });

    const result = await loginUser({
      email: ' ANA@example.com ',
      password
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'ana@example.com' });
    expect(select).toHaveBeenCalledWith('+password');
    expect(jwt.verify(result.token, process.env.JWT_SECRET).sub).toBe(userId);
    expect(result.user).toEqual({
      id: userId,
      name: 'Ana Castro',
      email: 'ana@example.com'
    });
    expect(result.user).not.toHaveProperty('password');
  });

  test('rechaza credenciales incorrectas o un usuario inexistente', async () => {
    const select = jest.fn().mockResolvedValue({
      password: await bcrypt.hash('una-clave-segura', 4)
    });
    User.findOne.mockReturnValue({ select });

    await expect(loginUser({
      email: 'ana@example.com',
      password: 'incorrecta'
    })).resolves.toBeNull();

    select.mockResolvedValue(null);
    await expect(loginUser({
      email: 'ana@example.com',
      password: 'una-clave-segura'
    })).resolves.toBeNull();
  });
});
