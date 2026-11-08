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
const { createPet } = require('../src/services/petService');
const app = require('../src/app');

const userId = '507f1f77bcf86cd799439011';
const originalJwtSecret = process.env.JWT_SECRET;

describe('POST /api/pets', () => {
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

  test('registra la mascota y la asocia al usuario autenticado', async () => {
    const petData = {
      name: 'Luna',
      species: 'Perro',
      breed: 'Labrador',
      age: 4
    };
    const createdPet = {
      _id: '507f191e810c19729de860ea',
      owner: userId,
      ...petData
    };
    createPet.mockResolvedValue(createdPet);

    const response = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${createToken()}`)
      .send(petData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: 'Mascota registrada correctamente',
      data: createdPet
    });
    expect(createPet).toHaveBeenCalledWith(userId, petData);
  });

  test.each([
    ['name', { species: 'Perro' }, 'El nombre de la mascota es obligatorio'],
    ['species', { name: 'Luna' }, 'La especie es obligatoria']
  ])('rechaza el registro cuando falta %s', async (_field, petData, expectedError) => {
    const response = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${createToken()}`)
      .send(petData);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      success: false,
      message: 'Datos inválidos',
      errors: expect.arrayContaining([expectedError])
    }));
    expect(createPet).not.toHaveBeenCalled();
  });

  test.each([
    ['sin token', undefined],
    ['con token inválido', 'Bearer token-invalido']
  ])('deniega el acceso %s', async (_description, authorization) => {
    let responseBuilder = request(app)
      .post('/api/pets')
      .send({ name: 'Luna', species: 'Perro' });

    if (authorization) {
      responseBuilder = responseBuilder.set('Authorization', authorization);
    }

    const response = await responseBuilder;

    expect(response.statusCode).toBe(401);
    expect(createPet).not.toHaveBeenCalled();
  });
});
