const {
  createPet,
  getPetsByOwner,
  getPetByOwner,
  updatePet
} = require('../services/petService');

const notFoundResponse = (res) => res.status(404).json({
  success: false,
  message: 'Mascota no encontrada'
});

const register = async (req, res) => {
  const pet = await createPet(req.user.sub, req.body);

  return res.status(201).json({
    success: true,
    message: 'Mascota registrada correctamente',
    data: pet
  });
};

const list = async (req, res) => {
  const pets = await getPetsByOwner(req.user.sub);

  return res.status(200).json({
    success: true,
    data: pets
  });
};

const get = async (req, res) => {
  const pet = await getPetByOwner(req.user.sub, req.params.id);

  if (!pet) {
    return notFoundResponse(res);
  }

  return res.status(200).json({
    success: true,
    data: pet
  });
};

const update = async (req, res) => {
  const pet = await updatePet(req.user.sub, req.params.id, req.body);

  if (!pet) {
    return notFoundResponse(res);
  }

  return res.status(200).json({
    success: true,
    message: 'Mascota actualizada correctamente',
    data: pet
  });
};

module.exports = { register, list, get, update };