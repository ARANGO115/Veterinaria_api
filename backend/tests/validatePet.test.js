const validatePet = require('../src/middlewares/validatePet');

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('validatePet', () => {
  test('acepta los datos requeridos y continúa', () => {
    const req = {
      body: {
        name: 'Luna',
        species: 'Perro',
        age: 4,
        birthDate: '2022-01-15'
      }
    };
    const res = response();
    const next = jest.fn();

    validatePet()(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rechaza datos requeridos ausentes', () => {
    const req = { body: { name: 'Luna' } };
    const res = response();
    const next = jest.fn();

    validatePet()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Datos inválidos'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza campos no permitidos y tipos inválidos', () => {
    const req = {
      body: {
        name: 'Luna',
        species: 'Perro',
        owner: 'otro-usuario',
        age: -1,
        birthDate: 'fecha-inválida'
      }
    };
    const res = response();
    const next = jest.fn();

    validatePet()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors).toEqual(expect.arrayContaining([
      'Campos no permitidos: owner',
      'El campo age debe ser un número mayor o igual a cero',
      'La fecha de nacimiento debe ser una fecha válida'
    ]));
    expect(next).not.toHaveBeenCalled();
  });

  test('permite actualizar parcialmente sin aceptar un cuerpo vacío', () => {
    const validRequest = { body: { weight: 8.5 } };
    const validResponse = response();
    const validNext = jest.fn();

    validatePet({ partial: true })(validRequest, validResponse, validNext);

    expect(validNext).toHaveBeenCalledTimes(1);

    const emptyResponse = response();
    const emptyNext = jest.fn();

    validatePet({ partial: true })({ body: {} }, emptyResponse, emptyNext);

    expect(emptyResponse.status).toHaveBeenCalledWith(400);
    expect(emptyNext).not.toHaveBeenCalled();
  });
});
