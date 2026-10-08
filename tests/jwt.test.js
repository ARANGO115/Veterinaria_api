const jwt = require('jsonwebtoken');
const { verifyToken } = require('../src/utils/jwt');

describe('Validación de token JWT', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'secreto-de-prueba';
  });

  test('acepta un token válido', () => {
    const token = jwt.sign(
      { sub: 'usuario123' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const payload = verifyToken(token);

    expect(payload.sub).toBe('usuario123');
  });

  test('el token contiene la identificación del usuario', () => {
    const token = jwt.sign(
      { sub: 'usuario123' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const payload = verifyToken(token);

    expect(payload).toHaveProperty('sub');
    expect(payload.sub).toBe('usuario123');
  });

  test('rechaza un token con firma inválida', () => {
    const token = jwt.sign(
      { sub: 'usuario123' },
      'otro-secreto',
      { expiresIn: '1h' }
    );

    expect(() => verifyToken(token)).toThrow();
  });

  test('rechaza un token expirado', () => {
    const token = jwt.sign(
      { sub: 'usuario123' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    expect(() => verifyToken(token)).toThrow();
  });
});