const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
  const authorization = req.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Se requiere un token de autenticación'
    });
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Se requiere un token de autenticación'
    });
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    if (error.message === 'JWT_SECRET no está configurado') {
      return next(error);
    }

    return res.status(401).json({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof payload.sub !== 'string' ||
    !mongoose.isObjectIdOrHexString(payload.sub)
  ) {
    return res.status(401).json({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
  }

  req.user = payload;
  return next();
};

module.exports = authMiddleware;
