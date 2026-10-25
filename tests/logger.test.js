const logger = require('../src/utils/logger');

describe('Logger', () => {
  let consoleLogOriginal;
  let consoleErrorOriginal;

  beforeEach(() => {
    consoleLogOriginal = console.log;
    consoleErrorOriginal = console.error;

    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = consoleLogOriginal;
    console.error = consoleErrorOriginal;

    jest.clearAllMocks();
  });

  test('registra un mensaje informativo', () => {
    logger.info('Prueba informativa');

    expect(console.log).toHaveBeenCalledTimes(1);

    const mensaje = console.log.mock.calls[0][0];

    expect(mensaje).toContain('[INFO]');
    expect(mensaje).toContain('Prueba informativa');
  });

  test('registra un mensaje de error con información adicional', () => {
    const error = new Error('Error de prueba');

    logger.error('Ocurrió un problema', error);

    expect(console.error).toHaveBeenCalledTimes(1);

    const [mensaje, errorRegistrado] = console.error.mock.calls[0];

    expect(mensaje).toContain('[ERROR]');
    expect(mensaje).toContain('Ocurrió un problema');
    expect(errorRegistrado).toBe(error);
  });

  test('registra un mensaje de error sin información adicional', () => {
    logger.error('Error sin detalles');

    expect(console.error).toHaveBeenCalledTimes(1);

    const [mensaje, detalle] = console.error.mock.calls[0];

    expect(mensaje).toContain('[ERROR]');
    expect(mensaje).toContain('Error sin detalles');
    expect(detalle).toBe('');
  });
});