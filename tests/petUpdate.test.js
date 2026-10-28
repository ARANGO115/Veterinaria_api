jest.mock('../src/services/petService', () => ({
  updatePet: jest.fn()
}));

const { update } = require('../src/controllers/petController');
const { updatePet } = require('../src/services/petService');
const validatePet = require('../src/middlewares/validatePet');

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
