
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment
} = require('../services/appointmentService');

const create = async (req, res) => {
  const appointment = await createAppointment(req.body);

  return res.status(201).json({
    success: true,
    message: 'Cita veterinaria registrada correctamente',
    data: appointment
  });
};

const getAll = async (_req, res) => {
  const appointments = await getAppointments();

  return res.status(200).json({
    success: true,
    data: appointments
  });
};

const getById = async (req, res) => {
  const appointment = await getAppointmentById(req.params.id);

  return res.status(200).json({
    success: true,
    data: appointment
  });
};

const reschedule = async (req, res) => {
  const appointment = await rescheduleAppointment(
    req.params.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: 'Cita veterinaria reprogramada correctamente',
    data: appointment
  });
};

const cancel = async (req, res) => {
  const appointment = await cancelAppointment(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Cita veterinaria cancelada correctamente',
    data: appointment
  });
};

module.exports = {
  create,
  getAll,
  getById,
  reschedule,
  cancel
};
