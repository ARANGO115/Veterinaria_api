jest.mock('../src/models/User', () => ({
  findById: jest.fn()
}));

jest.mock('../src/utils/jwt', () => ({
  verifyToken: jest.fn()
}));

const User = require('../src/models/User');
const authMiddleware = require('../src/middlewares/authMiddleware');
const { verifyToken } = require('../src/utils/jwt');

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011'
    });
  });

  test.each([undefined, 'Basic token', 'Bearer '])(
    'rechaza el encabezado Authorization inválido: %p',
    async authorization => {
      const req = {
        get: jest.fn().mockReturnValue(authorization)
      };
      const res = response();
      const next = jest.fn();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
      expect(verifyToken).not.toHaveBeenCalled();
    }
  );

  test('adjunta el payload y continúa con un token válido', async () => {
    const payload = {
      sub: '507f1f77bcf86cd799439011'
    };

    verifyToken.mockReturnValue(payload);

    const req = {
      get: jest.fn().mockReturnValue('Bearer jwt-token')
    };
    const res = response();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('jwt-token');
    expect(User.findById).toHaveBeenCalledWith(payload.sub);
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('responde 401 si el token no es válido', async () => {
    verifyToken.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = {
      get: jest.fn().mockReturnValue('Bearer jwt-token')
    };
    const res = response();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 401 cuando el token tiene un payload inválido', async () => {
    verifyToken.mockReturnValue({
      sub: 'id-invalido'
    });

    const req = {
      get: jest.fn().mockReturnValue('Bearer jwt-token')
    };
    const res = response();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
    expect(User.findById).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 401 cuando el usuario del token no existe', async () => {
    verifyToken.mockReturnValue({
      sub: '507f1f77bcf86cd799439011'
    });

    User.findById.mockResolvedValue(null);

    const req = {
      get: jest.fn().mockReturnValue('Bearer jwt-token')
    };
    const res = response();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('reenvía el error cuando JWT_SECRET no está configurado', async () => {
    const error = new Error('JWT_SECRET no está configurado');

    verifyToken.mockImplementation(() => {
      throw error;
    });

    const req = {
      get: jest.fn().mockReturnValue('Bearer jwt-token')
    };
    const res = response();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});