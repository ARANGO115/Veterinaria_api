const petFields = ['name', 'species', 'breed', 'age', 'gender', 'weight', 'color', 'birthDate', 'notes'];
const textFields = {
  name: 100,
  species: 50,
  breed: 100,
  gender: 20,
  color: 50,
  notes: 1000
};

const validatePet = ({ partial = false } = {}) => (req, res, next) => {
  const body = req.body;
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push('El cuerpo de la solicitud debe ser un objeto JSON');
  } else {
    const unknownFields = Object.keys(body).filter(field => !petFields.includes(field));
    const providedFields = petFields.filter(field => body[field] !== undefined);

    if (unknownFields.length > 0) {
      errors.push(`Campos no permitidos: ${unknownFields.join(', ')}`);
    }

    if (providedFields.length === 0) {
      errors.push('Debe proporcionar al menos un dato de la mascota');
    }

    for (const [field, maxLength] of Object.entries(textFields)) {
      if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].trim().length === 0)) {
        errors.push(`El campo ${field} debe ser un texto no vacío`);
      } else if (typeof body[field] === 'string' && body[field].trim().length > maxLength) {
        errors.push(`El campo ${field} no puede superar los ${maxLength} caracteres`);
      }
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

    if (body.birthDate !== undefined && (typeof body.birthDate !== 'string' || Number.isNaN(Date.parse(body.birthDate)))) {
      errors.push('La fecha de nacimiento debe ser una fecha válida');
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
