const errorHandler = (error, _req, res, _next) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un usuario registrado con ese correo electrónico'
    });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    const errors = error.name === 'ValidationError'
      ? Object.values(error.errors).map(validationError => validationError.message)
      : [error.message];

    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'El cuerpo de la solicitud contiene JSON inválido'
    });
  }

  console.error('Error al procesar la solicitud:', error);
  return res.status(500).json({
    success: false,
    message: 'Ocurrió un error interno'
  });
};

module.exports = errorHandler;
