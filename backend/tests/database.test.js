jest.mock('mongoose', () => ({
  connect: jest.fn()
}));

const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

describe('Conexión con MongoDB', () => {
  const originalMongoUri = process.env.MONGODB_URI;

  beforeEach(() => {
    delete process.env.MONGODB_URI;
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalMongoUri === undefined) {
      delete process.env.MONGODB_URI;
    } else {
      process.env.MONGODB_URI = originalMongoUri;
    }
  });

  test('exige configurar MONGODB_URI', async () => {
    await expect(connectDB()).rejects.toThrow(
      'Falta configurar MONGODB_URI'
    );
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  test('rechaza esquemas que no sean URI de MongoDB', async () => {
    process.env.MONGODB_URI = 'https://example.com';

    await expect(connectDB()).rejects.toThrow(
      'MONGODB_URI debe comenzar con mongodb:// o mongodb+srv://'
    );
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  test('conecta usando el URI configurado y un timeout acotado', async () => {
    process.env.MONGODB_URI = ' mongodb://localhost:27017/veterinaria ';

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/veterinaria',
      { serverSelectionTimeoutMS: 10000 }
    );
  });

  test('propaga los errores de conexión para que el arranque falle', async () => {
    const connectionError = new Error('No se pudo establecer la conexión');
    process.env.MONGODB_URI = 'mongodb://localhost:27017/veterinaria';
    mongoose.connect.mockRejectedValue(connectionError);

    await expect(connectDB()).rejects.toBe(connectionError);
  });
});
