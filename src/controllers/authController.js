const { loginUser } = require('../services/authService');

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

module.exports = { login };
