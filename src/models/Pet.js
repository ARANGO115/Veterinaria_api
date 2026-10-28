
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la mascota es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres']
  },
  species: {
    type: String,
    required: [true, 'La especie de la mascota es obligatoria'],
    trim: true
  },
  breed: {
    type: String,
    trim: true,
    default: ''
  },
  age: {
    type: Number,
    min: [0, 'La edad no puede ser negativa']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es obligatorio']
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.models.Pet || mongoose.model('Pet', petSchema);
