const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

describe('Modelo User', () => {
  const datosValidos = {
    name: 'Ana Castro',
    email: 'ANA@example.com',
    password: 'una-clave-segura'
  };

  test('acepta un usuario con datos válidos', async () => {
    const user = new User(datosValidos);

    await expect(user.validate()).resolves.toBeUndefined();
  });

  test('elimina espacios del nombre y correo y convierte el correo a minúsculas', async () => {
    const user = new User({
      name: '  Ana Castro  ',
      email: '  ANA@EXAMPLE.COM  ',
      password: 'una-clave-segura'
    });

    await user.validate();

    expect(user.name).toBe('Ana Castro');
    expect(user.email).toBe('ana@example.com');
  });

  test('rechaza un nombre demasiado corto', async () => {
    const user = new User({
      ...datosValidos,
      name: 'A'
    });

    await expect(user.validate()).rejects.toMatchObject({
      errors: {
        name: expect.any(mongoose.Error.ValidatorError)
      }
    });
  });

  test('rechaza un correo electrónico con formato inválido', async () => {
    const user = new User({
      ...datosValidos,
      email: 'correo-invalido'
    });

    await expect(user.validate()).rejects.toMatchObject({
      errors: {
        email: expect.any(mongoose.Error.ValidatorError)
      }
    });
  });

  test('rechaza una contraseña demasiado corta', async () => {
    const user = new User({
      ...datosValidos,
      password: '123'
    });

    await expect(user.validate()).rejects.toMatchObject({
      errors: {
        password: expect.any(mongoose.Error.ValidatorError)
      }
    });
  });

  test('marca la contraseña para que no se seleccione por defecto', () => {
    const passwordPath = User.schema.path('password');

    expect(passwordPath.options.select).toBe(false);
  });

  test('elimina la contraseña al convertir el usuario a JSON', () => {
    const user = new User(datosValidos);
    const resultado = user.toJSON();

    expect(resultado).not.toHaveProperty('password');
    expect(resultado).toHaveProperty('name', 'Ana Castro');
    expect(resultado).toHaveProperty('email', 'ana@example.com');
  });

  test('cifra la contraseña antes de guardar el usuario', async () => {
    const user = new User(datosValidos);
    const passwordOriginal = user.password;

    await user.validate();

    await User.schema.s.hooks.execPre('save', user);

    expect(user.password).not.toBe(passwordOriginal);

    expect(
      await bcrypt.compare(passwordOriginal, user.password)
    ).toBe(true);
  });

  test('no vuelve a cifrar la contraseña si no ha sido modificada', async () => {
    const user = new User(datosValidos);
    const hashExistente = await bcrypt.hash('una-clave-segura', 4);

    user.password = hashExistente;

    // Simula que la contraseña no ha cambiado desde el último guardado.
    user.isModified = jest.fn().mockReturnValue(false);

    await User.schema.s.hooks.execPre('save', user);

    expect(user.password).toBe(hashExistente);
    expect(user.isModified).toHaveBeenCalledWith('password');
  });
});