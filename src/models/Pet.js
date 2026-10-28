
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es obligatorio'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'El nombre de la mascota es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre de la mascota no puede superar los 100 caracteres']
  },
  species: {
    type: String,
    required: [true, 'La especie es obligatoria'],
    trim: true,
    maxlength: [50, 'La especie no puede superar los 50 caracteres']
  },
  breed: {
    type: String,
    trim: true,
    default: '',
    maxlength: [100, 'La raza no puede superar los 100 caracteres']
  },
  age: {
    type: Number,
    min: [0, 'La edad no puede ser negativa']
  },
  gender: {
    type: String,
    trim: true,
    maxlength: [20, 'El sexo no puede superar los 20 caracteres']
  },
  weight: {
    type: Number,
    min: [0, 'El peso no puede ser negativo']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [50, 'El color no puede superar los 50 caracteres']
  },
  birthDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las observaciones no pueden superar los 1000 caracteres']
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.models.Pet || mongoose.model('Pet', petSchema);
