jest.mock('../src/models/Pet', () => ({
  find: jest.fn()
}));

const Pet = require('../src/models/Pet');
const { getPetsByOwner } = require('../src/services/petService');

describe('petService.getPetsByOwner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('filtra las mascotas por el propietario recibido y ordena por fecha', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const pets = [
      { id: 'pet-1', owner: userId, name: 'Luna' }
    ];
    const sort = jest.fn().mockResolvedValue(pets);
    Pet.find.mockReturnValue({ sort });

    await expect(getPetsByOwner(userId)).resolves.toBe(pets);

    expect(Pet.find).toHaveBeenCalledWith({ owner: userId });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });
});
