jest.mock('../src/models/User', () => ({
  findById: jest.fn()
}));

jest.mock('../src/services/petService', () => ({
  createPet: jest.fn(),
  getPetsByOwner: jest.fn(),
  getPetByOwner: jest.fn(),
  updatePet: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const { getPetsByOwner } = require('../src/services/petService');
const app = require('../src/app');

const userId = '507f1f77bcf86cd799439011';
const originalJwtSecret = process.env.JWT_SECRET;

describe('GET /api/pets', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'secreto-de-prueba';
  });

  afterAll(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue({ _id: userId });
  });

  const createToken = () => jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  test('devuelve las mascotas solicitadas para el usuario autenticado', async () => {
    const pets = [
      { _id: '507f191e810c19729de860ea', owner: userId, name: 'Luna' },
      { _id: '507f191e810c19729de860eb', owner: userId, name: 'Max' }
    ];
    getPetsByOwner.mockResolvedValue(pets);

    const response = await request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${createToken()}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: pets
    });
    expect(getPetsByOwner).toHaveBeenCalledWith(userId);
  });

  test('devuelve una lista vacía si el usuario no tiene mascotas', async () => {
    getPetsByOwner.mockResolvedValue([]);

    const response = await request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${createToken()}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: []
    });
    expect(getPetsByOwner).toHaveBeenCalledWith(userId);
  });

  test.each([
    ['sin token', undefined],
    ['con token inválido', 'Bearer token-invalido']
  ])('deniega el acceso %s', async (_description, authorization) => {
    let responseBuilder = request(app).get('/api/pets');

    if (authorization) {
      responseBuilder = responseBuilder.set('Authorization', authorization);
    }

    const response = await responseBuilder;

    expect(response.statusCode).toBe(401);
    expect(getPetsByOwner).not.toHaveBeenCalled();
  });
});
