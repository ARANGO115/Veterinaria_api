const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegistration = (req, res, next) => {
  const body = req.body;
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push('El cuerpo de la solicitud debe ser un objeto JSON');
  } else {
    if (typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
    }
    if (typeof body.email !== 'string' || !emailPattern.test(body.email.trim())) {
      errors.push('Se requiere un correo electrónico válido');
    }
    if (typeof body.password !== 'string' || body.password.length < 8) {
      errors.push('La contraseña es obligatoria y debe tener al menos 8 caracteres');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors
    });
  }

  return next();
};

module.exports = validateRegistration;
