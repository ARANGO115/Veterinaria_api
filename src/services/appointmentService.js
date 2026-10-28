
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');

const createAppointment = async ({ pet, date, time }) => {
  if (!mongoose.isObjectIdOrHexString(pet)) {
    const error = new Error('El ID de la mascota no es válido');
    error.statusCode = 400;
    throw error;
  }

  const existingPet = await Pet.findById(pet);

  if (!existingPet) {
    const error = new Error('La mascota indicada no existe');
    error.statusCode = 404;
    throw error;
  }

  const appointment = await Appointment.create({
    pet,
    date,
    time,
    status: 'scheduled'
  });

  return appointment;
};

const getAppointments = async () => {
  return Appointment.find()
    .populate('pet', 'name species breed')
    .sort({ date: 1, time: 1 });
};

const getAppointmentById = async (id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    const error = new Error('El ID de la cita no es válido');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(id)
    .populate('pet', 'name species breed');

  if (!appointment) {
    const error = new Error('La cita no existe');
    error.statusCode = 404;
    throw error;
  }

  return appointment;
};

const rescheduleAppointment = async (id, { date, time }) => {
  const appointment = await getAppointmentById(id);

  if (appointment.status === 'cancelled') {
    const error = new Error('No se puede reprogramar una cita cancelada');
    error.statusCode = 400;
    throw error;
  }

  appointment.date = date;
  appointment.time = time;

  await appointment.save();

  return appointment;
};

const cancelAppointment = async (id) => {
  const appointment = await getAppointmentById(id);

  if (appointment.status === 'cancelled') {
    const error = new Error('La cita ya está cancelada');
    error.statusCode = 400;
    throw error;
  }

  appointment.status = 'cancelled';
  await appointment.save();

  return appointment;
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment
};
