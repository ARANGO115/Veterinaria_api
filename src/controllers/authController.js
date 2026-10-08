const { registerUser, loginUser } = require('../services/authService');

const register = async (req, res) => {
  const user = await registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: 'Usuario registrado correctamente',
    data: user
  });
};

const login = async (req, res) => {
  const authentication = await loginUser(req.body);

  if (!authentication) {
    return res.status(401).json({
      success: false,
      message: 'Correo electrónico o contraseña incorrectos'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Inicio de sesión exitoso',
    data: authentication
  });
};

module.exports = { register, login };
