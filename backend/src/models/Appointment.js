
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'La mascota es obligatoria']
  },
  date: {
    type: Date,
    required: [true, 'La fecha de la cita es obligatoria']
  },
  time: {
    type: String,
    required: [true, 'La hora de la cita es obligatoria'],
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener el formato HH:mm']
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled'],
    default: 'scheduled',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.models.Appointment
  || mongoose.model('Appointment', appointmentSchema);
