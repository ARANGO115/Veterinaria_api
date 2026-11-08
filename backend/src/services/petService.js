const Pet = require('../models/Pet');

const petFields = ['name', 'species', 'breed', 'age', 'gender', 'weight', 'color', 'birthDate', 'notes'];

const selectPetFields = (data) => petFields.reduce((fields, field) => {
  if (data[field] !== undefined) {
    fields[field] = data[field];
  }
  return fields;
}, {});

const createPet = async (userId, data) => Pet.create({
  owner: userId,
  ...selectPetFields(data)
});

const getPetsByOwner = (userId) => Pet.find({ owner: userId }).sort({ createdAt: -1 });

const getPetByOwner = (userId, petId) => Pet.findOne({
  _id: petId,
  owner: userId
});

const updatePet = (userId, petId, data) => Pet.findOneAndUpdate(
  { _id: petId, owner: userId },
  { $set: selectPetFields(data) },
  { new: true, runValidators: true }
);

module.exports = {
  createPet,
  getPetsByOwner,
  getPetByOwner,
  updatePet
};