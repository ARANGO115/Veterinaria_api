
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateDateTime = (date, time) => {
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) ||
    Number.isNaN(Date.parse(date))
  ) {
    throw createError('La fecha no es válida', 400);
  }

  if (
    typeof time !== 'string' ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    throw createError(
      'La hora debe tener el formato HH:mm',
      400
    );
  }

  // Evita aceptar fechas como 2026-02-31.
  const datePart = date.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  const parsedDate = new Date(`${datePart}T00:00:00.000Z`);

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() + 1 !== month ||
    parsedDate.getUTCDate() !== day
  ) {
    throw createError('La fecha no es válida', 400);
  }

  // Regla de negocio: la cita debe ser futura.
  const appointmentDateTime = new Date(
    `${datePart}T${time}:00`
  );

  if (appointmentDateTime.getTime() <= Date.now()) {
    throw createError(
      'La fecha y hora de la cita deben ser futuras',
      400
    );
  }

  return parsedDate;
};

const getOwnedPet = async (petId, userId) => {
  if (!mongoose.isObjectIdOrHexString(petId)) {
    throw createError('El ID de la mascota no es válido', 400);
  }

  const pet = await Pet.findById(petId);

  if (!pet) {
    throw createError('La mascota indicada no existe', 404);
  }

  if (pet.owner.toString() !== userId) {
    throw createError(
      'No tienes permiso para gestionar esta mascota',
      403
    );
  }

  return pet;
};

const getOwnedAppointment = async (id, userId) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw createError('El ID de la cita no es válido', 400);
  }

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw createError('La cita no existe', 404);
  }

  // La cita pertenece a la mascota; la mascota tiene el propietario.
  const pet = await Pet.findById(appointment.pet);

  if (!pet) {
    throw createError(
      'La mascota asociada a la cita no existe',
      404
    );
  }

  if (pet.owner.toString() !== userId) {
    // Se responde 404 para no revelar citas de otros usuarios.
    throw createError('La cita no existe', 404);
  }

  await appointment.populate('pet', 'name species breed');

  return appointment;
};

const createAppointment = async (data, userId) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createError('Los datos de la cita son obligatorios', 400);
  }

  const { pet, date, time } = data;

  if (
    pet === undefined ||
    pet === null ||
    date === undefined ||
    time === undefined
  ) {
    throw createError(
      'La mascota, fecha y hora son obligatorias',
      400
    );
  }

  const existingPet = await getOwnedPet(pet, userId);
  const parsedDate = validateDateTime(date, time);

  return Appointment.create({
    pet: existingPet._id,
    date: parsedDate,
    time,
    status: 'scheduled'
  });
};

const getAppointments = async (userId) => {
  const pets = await Pet.find({ owner: userId }).select('_id');

  return Appointment.find({
    pet: { $in: pets.map((pet) => pet._id) }
  })
    .populate('pet', 'name species breed')
    .sort({ date: 1, time: 1 });
};

const getAppointmentById = async (id, userId) => {
  return getOwnedAppointment(id, userId);
};

const rescheduleAppointment = async (id, data, userId) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createError('Los datos de reprogramación son obligatorios', 400);
  }

  const { date, time } = data;

  if (date === undefined || time === undefined) {
    throw createError(
      'La fecha y hora son obligatorias',
      400
    );
  }

  const appointment = await getOwnedAppointment(id, userId);

  if (appointment.status === 'cancelled') {
    throw createError(
      'No se puede reprogramar una cita cancelada',
      400
    );
  }

  const parsedDate = validateDateTime(date, time);

  appointment.date = parsedDate;
  appointment.time = time;

  await appointment.save();

  return appointment;
};

const cancelAppointment = async (id, userId) => {
  const appointment = await getOwnedAppointment(id, userId);

  if (appointment.status === 'cancelled') {
    throw createError('La cita ya está cancelada', 400);
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
