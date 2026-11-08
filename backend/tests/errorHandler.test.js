const errorHandler = require('../src/middlewares/errorHandler');

describe('Middleware errorHandler', () => {
  let req;
  let res;
  let next;
  let consoleErrorOriginal;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    consoleErrorOriginal = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleErrorOriginal;
    jest.clearAllMocks();
  });

  test('responde 409 cuando el correo ya está registrado', () => {
    const error = {
      code: 11000
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Ya existe un usuario registrado con ese correo electrónico'
    });
  });

  test('responde 400 cuando hay errores de validación', () => {
    const error = {
      name: 'ValidationError',
      errors: {
        name: {
          message: 'El nombre es obligatorio'
        },
        email: {
          message: 'El correo electrónico no es válido'
        }
      }
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Datos inválidos',
      errors: [
        'El nombre es obligatorio',
        'El correo electrónico no es válido'
      ]
    });
  });

  test('responde 400 cuando ocurre un error CastError', () => {
    const error = {
      name: 'CastError',
      message: 'Identificador inválido'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Datos inválidos',
      errors: ['Identificador inválido']
    });
  });

  test('responde 400 cuando el cuerpo contiene JSON inválido', () => {
    const error = new SyntaxError('JSON inválido');

    error.status = 400;
    error.body = '{nombre: Ana}';

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'El cuerpo de la solicitud contiene JSON inválido'
    });
  });

  test('responde 500 cuando ocurre un error inesperado', () => {
    const error = new Error('Error interno de prueba');

    errorHandler(error, req, res, next);

    expect(console.error).toHaveBeenCalledWith(
      'Error al procesar la solicitud:',
      error
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Ocurrió un error interno'
    });
  });
});