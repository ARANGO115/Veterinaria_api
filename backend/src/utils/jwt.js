const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { verifyToken };