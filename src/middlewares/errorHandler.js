const errorHandler = (error, _req, res, _next) => {
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
