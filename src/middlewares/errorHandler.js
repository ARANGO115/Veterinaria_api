const logger = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  logger.error('Error procesando la solicitud', error);

  const requestedStatus = error.statusCode || error.status;
  const statusCode = Number.isInteger(requestedStatus)
    && requestedStatus >= 400
    && requestedStatus <= 599
    ? requestedStatus
    : 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : error.message
  });
};

module.exports = errorHandler;
