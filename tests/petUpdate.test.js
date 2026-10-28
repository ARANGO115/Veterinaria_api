jest.mock('../src/models/User', () => ({
  findById: jest.fn()
}));

jest.mock('../src/services/petService', () => ({
  updatePet: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const { update } = require('../src/controllers/petController');
const { updatePet } = require('../src/services/petService');
const validatePet = require('../src/middlewares/validatePet');
const app = require('../src/app');

const userId = '507f1f77bcf86cd799439011';
const petId = '507f191e810c19729de860ea';
const originalJwtSecret = process.env.JWT_SECRET;

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('Actualización de mascotas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('actualiza una mascota del usuario autenticado', async () => {
    const updatedPet = {
      id: 'pet-123',
      owner: 'user-123',
      name: 'Luna actualizada',
      species: 'Perro'
    };
    updatePet.mockResolvedValue(updatedPet);

    const req = {
      user: { sub: 'user-123' },
      params: { id: 'pet-123' },
      body: { name: 'Luna actualizada' }
    };
    const res = response();

    await update(req, res);

    expect(updatePet).toHaveBeenCalledWith(
      'user-123',
      'pet-123',
      { name: 'Luna actualizada' }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Mascota actualizada correctamente',
      data: updatedPet
    });
  });

  describe('PUT /api/pets/:id', () => {
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

    test('guarda los cambios válidos de una mascota propia', async () => {
      const updatedPet = {
        _id: petId,
        owner: userId,
        name: 'Luna actualizada',
        species: 'Perro'
      };
      updatePet.mockResolvedValue(updatedPet);

      const response = await request(app)
        .put(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${createToken()}`)
        .send({ name: 'Luna actualizada' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Mascota actualizada correctamente',
        data: updatedPet
      });
      expect(updatePet).toHaveBeenCalledWith(
        userId,
        petId,
        { name: 'Luna actualizada' }
      );
    });

    test('deniega la actualización de una mascota ajena', async () => {
      updatePet.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${createToken()}`)
        .send({ name: 'Cambio no autorizado' });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Mascota no encontrada'
      });
      expect(updatePet).toHaveBeenCalledWith(
        userId,
        petId,
        { name: 'Cambio no autorizado' }
      );
    });

    test('rechaza cambios inválidos antes de actualizar la mascota', async () => {
      const response = await request(app)
        .put(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${createToken()}`)
        .send({ age: -1 });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(expect.objectContaining({
        success: false,
        message: 'Datos inválidos'
      }));
      expect(updatePet).not.toHaveBeenCalled();
    });

    test('rechaza la solicitud sin token', async () => {
      const response = await request(app)
        .put(`/api/pets/${petId}`)
        .send({ name: 'Luna actualizada' });

      expect(response.statusCode).toBe(401);
      expect(updatePet).not.toHaveBeenCalled();
    });
  });

  test('deniega la actualización cuando la mascota no pertenece al usuario', async () => {
    updatePet.mockResolvedValue(null);

    const req = {
      user: { sub: 'user-123' },
      params: { id: 'pet-of-another-user' },
      body: { name: 'Cambio no autorizado' }
    };
    const res = response();

    await update(req, res);

    expect(updatePet).toHaveBeenCalledWith(
      'user-123',
      'pet-of-another-user',
      { name: 'Cambio no autorizado' }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Mascota no encontrada'
    });
  });

  test('rechaza datos inválidos antes de ejecutar la actualización', () => {
    const req = {
      body: {
        name: '',
        age: -1,
        owner: 'another-user'
      }
    };
    const res = response();
    const next = jest.fn();

    validatePet({ partial: true })(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Datos inválidos'
    }));
    expect(next).not.toHaveBeenCalled();
    expect(updatePet).not.toHaveBeenCalled();
  });
});
