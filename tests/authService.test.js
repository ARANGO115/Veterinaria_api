jest.mock('../src/models/User', () => jest.fn());
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('../src/services/authService');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreto-de-prueba';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  test('registra un usuario y devuelve solo sus datos públicos', async () => {
    const user = {
      id: 'user-123',
      name: 'Ana Castro',
      email: 'ana@example.com',
      password: 'hash',
      save: jest.fn()
    };
    User.mockImplementation(() => user);

    await expect(registerUser({
      name: 'Ana Castro',
      email: 'ana@example.com',
      password: 'una-clave-segura'
    })).resolves.toEqual({
      id: 'user-123',
      name: 'Ana Castro',
      email: 'ana@example.com'
    });

    expect(User).toHaveBeenCalledWith({
      name: 'Ana Castro',
      email: 'ana@example.com',
      password: 'una-clave-segura'
    });
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  test('autentica credenciales válidas y firma un JWT', async () => {
    const user = {
      id: 'user-123',
      name: 'Ana Castro',
      email: 'ana@example.com',
      password: 'hash'
    };
    const select = jest.fn().mockResolvedValue(user);
    User.findOne = jest.fn().mockReturnValue({ select });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('jwt-token');

    await expect(loginUser({
      email: ' ANA@EXAMPLE.COM ',
      password: 'una-clave-segura'
    })).resolves.toEqual({
      token: 'jwt-token',
      user: {
        id: 'user-123',
        name: 'Ana Castro',
        email: 'ana@example.com'
      }
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'ana@example.com' });
    expect(select).toHaveBeenCalledWith('+password');
    expect(bcrypt.compare).toHaveBeenCalledWith('una-clave-segura', 'hash');
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: 'user-123' },
      'secreto-de-prueba',
      { expiresIn: '1h' }
    );
  });

  test.each([
    [null, false],
    [{ id: 'user-123', password: 'hash' }, false]
  ])('rechaza usuario inexistente o contraseña incorrecta', async (user, matches) => {
    const select = jest.fn().mockResolvedValue(user);
    User.findOne = jest.fn().mockReturnValue({ select });
    bcrypt.compare.mockResolvedValue(matches);

    await expect(loginUser({
      email: 'ana@example.com',
      password: 'incorrecta'
    })).resolves.toBeNull();

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test('informa cuando falta JWT_SECRET', async () => {
    const select = jest.fn().mockResolvedValue({
      id: 'user-123',
      password: 'hash'
    });
    User.findOne = jest.fn().mockReturnValue({ select });
    bcrypt.compare.mockResolvedValue(true);
    delete process.env.JWT_SECRET;

    await expect(loginUser({
      email: 'ana@example.com',
      password: 'una-clave-segura'
    })).rejects.toThrow('JWT_SECRET no está configurado');
  });
});
