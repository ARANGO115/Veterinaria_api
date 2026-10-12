const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
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

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    if (error.message === 'JWT_SECRET no está configurado') {
      return next(error);
    }

    return res.status(401).json({
      success: false,
      message: 'El token de autenticación no es válido o ha expirado'
    });
  }
};

module.exports = authMiddleware;