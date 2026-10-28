jest.mock('../src/models/Pet', () => ({
  findOneAndUpdate: jest.fn()
}));

const Pet = require('../src/models/Pet');
const { updatePet } = require('../src/services/petService');

describe('petService.updatePet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('incluye el propietario autenticado en el filtro de actualización', async () => {
    const updatedPet = {
      id: 'pet-123',
      owner: 'user-123',
      name: 'Luna actualizada'
    };
    Pet.findOneAndUpdate.mockResolvedValue(updatedPet);

    const result = await updatePet('user-123', 'pet-123', {
      name: 'Luna actualizada',
      owner: 'otro-usuario'
    });

    expect(result).toBe(updatedPet);
    expect(Pet.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'pet-123', owner: 'user-123' },
      { $set: { name: 'Luna actualizada' } },
      { new: true, runValidators: true }
    );
  });
});
