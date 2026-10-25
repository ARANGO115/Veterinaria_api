jest.mock('../src/utils/jwt', () => ({
  verifyToken: jest.fn()
}));

const authMiddleware = require('../src/middlewares/authMiddleware');
const { verifyToken } = require('../src/utils/jwt');

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('authMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([undefined, 'Basic token', 'Bearer '])(
    'rechaza el encabezado Authorization inválido: %p',
    authorization => {
      const req = { get: jest.fn().mockReturnValue(authorization) };
      const res = response();
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
      expect(verifyToken).not.toHaveBeenCalled();
    }
  );

  test('adjunta el payload y continúa con un token válido', () => {
    const payload = { sub: 'user-123' };
    verifyToken.mockReturnValue(payload);
    const req = { get: jest.fn().mockReturnValue('Bearer jwt-token') };
    const res = response();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('jwt-token');
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('responde 401 si el token no es válido', () => {
    verifyToken.mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = { get: jest.fn().mockReturnValue('Bearer jwt-token') };
    const res = response();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
