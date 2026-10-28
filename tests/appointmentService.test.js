
const mongoose = require('mongoose');

jest.mock('../src/models/Appointment', () => ({
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn()
}));

jest.mock('../src/models/Pet', () => ({
  findById: jest.fn(),
  find: jest.fn()
}));

const Appointment = require('../src/models/Appointment');
const Pet = require('../src/models/Pet');

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment
} = require('../src/services/appointmentService');

describe('appointmentService', () => {
  const userId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439012';
  const petId = '507f1f77bcf86cd799439013';
  const appointmentId = '507f1f77bcf86cd799439014';

  const futureDate = () => {
    const date = new Date(Date.now() + 86400000);
    return date.toISOString().slice(0, 10);
  };

  const makePet = (owner = userId) => ({
    _id: new mongoose.Types.ObjectId(petId),
    owner: new mongoose.Types.ObjectId(owner)
  });

  const makeAppointment = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(appointmentId),
    pet: new mongoose.Types.ObjectId(petId),
    date: new Date('2035-05-20T00:00:00.000Z'),
    time: '10:00',
    status: 'scheduled',
    populate: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    test('crea una cita para una mascota del usuario', async () => {
      const pet = makePet();

      Pet.findById.mockResolvedValue(pet);
      Appointment.create.mockImplementation(async (data) => data);

      const data = {
        pet: petId,
        date: futureDate(),
        time: '10:00'
      };

      const result = await createAppointment(data, userId);

      expect(Pet.findById).toHaveBeenCalledWith(petId);
      expect(Appointment.create).toHaveBeenCalledWith({
        pet: pet._id,
        date: new Date(`${data.date}T00:00:00.000Z`),
        time: '10:00',
        status: 'scheduled'
      });
      expect(result.status).toBe('scheduled');
    });

    test('rechaza datos ausentes', async () => {
      await expect(createAppointment({}, userId))
        .rejects.toMatchObject({ statusCode: 400 });

      expect(Appointment.create).not.toHaveBeenCalled();
    });

    test('rechaza un ID de mascota inválido', async () => {
      await expect(createAppointment({
        pet: 'id-invalido',
        date: futureDate(),
        time: '10:00'
      }, userId)).rejects.toMatchObject({ statusCode: 400 });
    });

    test('rechaza una mascota inexistente', async () => {
      Pet.findById.mockResolvedValue(null);

      await expect(createAppointment({
        pet: petId,
        date: futureDate(),
        time: '10:00'
      }, userId)).rejects.toMatchObject({ statusCode: 404 });

      expect(Appointment.create).not.toHaveBeenCalled();
    });

    test('rechaza una mascota de otro usuario', async () => {
      Pet.findById.mockResolvedValue(makePet(otherUserId));

      await expect(createAppointment({
        pet: petId,
        date: futureDate(),
        time: '10:00'
      }, userId)).rejects.toMatchObject({ statusCode: 403 });

      expect(Appointment.create).not.toHaveBeenCalled();
    });

    test('rechaza una hora inválida', async () => {
      Pet.findById.mockResolvedValue(makePet());

      await expect(createAppointment({
        pet: petId,
        date: futureDate(),
        time: '25:90'
      }, userId)).rejects.toMatchObject({ statusCode: 400 });

      expect(Appointment.create).not.toHaveBeenCalled();
    });

    test('rechaza una fecha inexistente', async () => {
      Pet.findById.mockResolvedValue(makePet());

      await expect(createAppointment({
        pet: petId,
        date: '2026-02-31',
        time: '10:00'
      }, userId)).rejects.toMatchObject({ statusCode: 400 });

      expect(Appointment.create).not.toHaveBeenCalled();
    });
  });

  describe('getAppointments', () => {
    test('consulta las citas de las mascotas del usuario', async () => {
      const pets = [{ _id: petId }];
      const appointments = [{ _id: appointmentId }];

      Pet.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(pets)
      });

      const populate = jest.fn().mockReturnThis();
      const sort = jest.fn().mockResolvedValue(appointments);

      Appointment.find.mockReturnValue({ populate, sort });

      const result = await getAppointments(userId);

      expect(Pet.find).toHaveBeenCalledWith({ owner: userId });
      expect(Appointment.find).toHaveBeenCalledWith({
        pet: { $in: [petId] }
      });
      expect(result).toEqual(appointments);
    });

    test('excluye las citas de mascotas que pertenecen a otros usuarios', async () => {
      const ownPetId = new mongoose.Types.ObjectId();
      const ownAppointments = [{ _id: appointmentId }];

      Pet.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([
          { _id: ownPetId }
        ])
      });

      const populate = jest.fn().mockReturnThis();
      const sort = jest.fn().mockResolvedValue(ownAppointments);

      Appointment.find.mockReturnValue({ populate, sort });

      const result = await getAppointments(userId);

      expect(Pet.find).toHaveBeenCalledWith({ owner: userId });
      expect(Appointment.find).toHaveBeenCalledWith({
        pet: { $in: [ownPetId] }
      });
      expect(result).toEqual(ownAppointments);
    });

    test('devuelve una lista vacía cuando no hay citas', async () => {
      Pet.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([])
      });

      Appointment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      });

      await expect(getAppointments(userId)).resolves.toEqual([]);
    });
  });

  describe('getAppointmentById', () => {
    test('consulta una cita propia', async () => {
      const appointment = makeAppointment();

      Appointment.findById.mockResolvedValue(appointment);
      Pet.findById.mockResolvedValue(makePet());

      const result = await getAppointmentById(appointmentId, userId);

      expect(Appointment.findById).toHaveBeenCalledWith(appointmentId);
      expect(appointment.populate).toHaveBeenCalledWith(
        'pet',
        'name species breed'
      );
      expect(result).toBe(appointment);
    });

    test('rechaza un ID de cita inválido', async () => {
      await expect(getAppointmentById('invalido', userId))
        .rejects.toMatchObject({ statusCode: 400 });
    });

    test('rechaza una cita de otro usuario', async () => {
      Appointment.findById.mockResolvedValue(makeAppointment());
      Pet.findById.mockResolvedValue(makePet(otherUserId));

      await expect(getAppointmentById(appointmentId, userId))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('rescheduleAppointment', () => {
    test('reprograma una cita propia', async () => {
      const appointment = makeAppointment();

      Appointment.findById.mockResolvedValue(appointment);
      Pet.findById.mockResolvedValue(makePet());

      const date = futureDate();

      const result = await rescheduleAppointment(
        appointmentId,
        { date, time: '11:30' },
        userId
      );

      expect(result.date).toEqual(
        new Date(`${date}T00:00:00.000Z`)
      );
      expect(result.time).toBe('11:30');
      expect(appointment.save).toHaveBeenCalledTimes(1);
    });

    test('no guarda cambios si la fecha es inválida', async () => {
      const originalDate = new Date('2035-05-20T00:00:00.000Z');
      const appointment = makeAppointment({
        date: originalDate,
        time: '10:00'
      });

      Appointment.findById.mockResolvedValue(appointment);
      Pet.findById.mockResolvedValue(makePet());

      await expect(rescheduleAppointment(
        appointmentId,
        { date: '2026-02-31', time: '11:00' },
        userId
      )).rejects.toMatchObject({ statusCode: 400 });

      expect(appointment.date).toBe(originalDate);
      expect(appointment.time).toBe('10:00');
      expect(appointment.save).not.toHaveBeenCalled();
    });

    test('rechaza la reprogramación de una cita cancelada', async () => {
      const appointment = makeAppointment({ status: 'cancelled' });

      Appointment.findById.mockResolvedValue(appointment);
      Pet.findById.mockResolvedValue(makePet());

      await expect(rescheduleAppointment(
        appointmentId,
        { date: futureDate(), time: '11:00' },
        userId
      )).rejects.toMatchObject({ statusCode: 400 });

      expect(appointment.save).not.toHaveBeenCalled();
    });
  });

  describe('cancelAppointment', () => {
    test('cancela una cita sin eliminarla', async () => {
      const appointment = makeAppointment();

      Appointment.findById.mockResolvedValue(appointment);
      Pet.findById.mockResolvedValue(makePet());

      const result = await cancelAppointment(appointmentId, userId);

      expect(result.status).toBe('cancelled');
      expect(appointment.save).toHaveBeenCalledTimes(1);
      expect(Appointment.findById).toHaveBeenCalledWith(appointmentId);
    });

    test('rechaza cancelar una cita ya cancelada', async () => {
      const appointment = makeAppointment({ status: 'cancelled' });

      Appointment.findById.mockResolvedValue(appointment);
      Pet.findById.mockResolvedValue(makePet());

      await expect(cancelAppointment(appointmentId, userId))
        .rejects.toMatchObject({ statusCode: 400 });

      expect(appointment.save).not.toHaveBeenCalled();
    });
  });
});
