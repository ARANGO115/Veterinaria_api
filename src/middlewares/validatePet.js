const petFields = ['name', 'species', 'breed', 'age', 'gender', 'weight', 'color', 'birthDate', 'notes'];

const validatePet = ({ partial = false } = {}) => (req, res, next) => {
  const body = req.body;
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push('El cuerpo de la solicitud debe ser un objeto JSON');
  } else {
    const providedFields = petFields.filter(field => body[field] !== undefined);

    if (providedFields.length === 0) {
      errors.push('Debe proporcionar al menos un dato de la mascota');
    }

    if (!partial || body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        errors.push('El nombre de la mascota es obligatorio');
      }
    }

    if (!partial || body.species !== undefined) {
      if (typeof body.species !== 'string' || body.species.trim().length === 0) {
        errors.push('La especie es obligatoria');
      }
    }

    for (const field of ['age', 'weight']) {
      if (body[field] !== undefined && (typeof body[field] !== 'number' || !Number.isFinite(body[field]) || body[field] < 0)) {
        errors.push(`El campo ${field} debe ser un número mayor o igual a cero`);
      }
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

module.exports = validatePet;
