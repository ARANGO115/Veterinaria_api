const { registerUser } = require('../services/authService');

const register = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    success: true,
    message: 'Usuario registrado correctamente',
    data: user
  });
};

module.exports = { register };
