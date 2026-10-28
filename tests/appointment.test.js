
jest.mock('../src/services/appointmentService', () => ({
  createAppointment: jest.fn(),
  getAppointments: jest.fn(),
  getAppointmentById: jest.fn(),
  rescheduleAppointment: jest.fn(),
  cancelAppointment: jest.fn()
}));

jest.mock('../src/utils/jwt', () => ({
  verifyToken: jest.fn()
}));

jest.mock('../src/models/User', () => ({
  findById: jest.fn()
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment
} = require('../src/services/appointmentService');

const { verifyToken } = require('../src/utils/jwt');
const User = require('../src/models/User');

describe('Integración de endpoints de citas', () => {
  const userId = '507f1f77bcf86cd799439011';
  const petId = '507f1f77bcf86cd799439012';
  const appointmentId = '507f1f77bcf86cd799439013';

  const token = 'jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();

    verifyToken.mockReturnValue({ sub: userId });
    User.findById.mockResolvedValue({ _id: new mongoose.Types.ObjectId(userId) });
  });

  const authenticatedRequest = () => ({
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    patch: (url) => request(app).patch(url).set('Authorization', `Bearer ${token}`)
  });

  test('rechaza consultar citas sin token', async () => {
    const response = await request(app).get('/api/appointments');

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(getAppointments).not.toHaveBeenCalled();
  });

  test('rechaza un token inválido', async () => {
    verifyToken.mockImplementation(() => {
      throw new Error('Token inválido');
    });

    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(getAppointments).not.toHaveBeenCalled();
  });

  test('crea una cita y devuelve HTTP 201', async () => {
    const body = {
      pet: petId,
      date: '2035-05-20',
      time: '10:00'
    };

    createAppointment.mockResolvedValue({
      _id: appointmentId,
      ...body,
      status: 'scheduled'
    });

    const response = await authenticatedRequest()
      .post('/api/appointments')
      .send(body);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(appointmentId);
    expect(createAppointment).toHaveBeenCalledWith(body, userId);
  });

  test('devuelve el error del servicio al crear una cita inválida', async () => {
    createAppointment.mockRejectedValue(
      Object.assign(new Error('La fecha no es válida'), { statusCode: 400 })
    );

    const response = await authenticatedRequest()
      .post('/api/appointments')
      .send({ pet: petId, date: 'fecha-inválida', time: '10:00' });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('consulta las citas del usuario', async () => {
    getAppointments.mockResolvedValue([
      { _id: appointmentId, pet: petId, time: '10:00' }
    ]);

    const response = await authenticatedRequest().get('/api/appointments');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(getAppointments).toHaveBeenCalledWith(userId);
  });

  test('devuelve una lista vacía si el usuario no tiene citas', async () => {
    getAppointments.mockResolvedValue([]);

    const response = await authenticatedRequest().get('/api/appointments');

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  test('consulta una cita por ID', async () => {
    getAppointmentById.mockResolvedValue({
      _id: appointmentId,
      pet: petId,
      time: '10:00'
    });

    const response = await authenticatedRequest()
      .get(`/api/appointments/${appointmentId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data._id).toBe(appointmentId);
    expect(getAppointmentById).toHaveBeenCalledWith(appointmentId, userId);
  });

  test('devuelve 404 cuando el servicio rechaza el acceso a una cita ajena', async () => {
    getAppointmentById.mockRejectedValue(
      Object.assign(new Error('La cita no existe'), { statusCode: 404 })
    );

    const response = await authenticatedRequest()
      .get(`/api/appointments/${appointmentId}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('reprograma una cita y devuelve HTTP 200', async () => {
    const body = { date: '2035-05-21', time: '11:30' };

    rescheduleAppointment.mockResolvedValue({
      _id: appointmentId,
      ...body,
      status: 'scheduled'
    });

    const response = await authenticatedRequest()
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .send(body);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(rescheduleAppointment).toHaveBeenCalledWith(
      appointmentId,
      body,
      userId
    );
  });

  test('devuelve error cuando falla la reprogramación', async () => {
    rescheduleAppointment.mockRejectedValue(
      Object.assign(new Error('La fecha no es válida'), { statusCode: 400 })
    );

    const response = await authenticatedRequest()
      .patch(`/api/appointments/${appointmentId}/reschedule`)
      .send({ date: 'fecha-inválida', time: '10:00' });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('cancela una cita y devuelve HTTP 200', async () => {
    cancelAppointment.mockResolvedValue({
      _id: appointmentId,
      status: 'cancelled'
    });

    const response = await authenticatedRequest()
      .patch(`/api/appointments/${appointmentId}/cancel`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.status).toBe('cancelled');
    expect(cancelAppointment).toHaveBeenCalledWith(appointmentId, userId);
  });

  test('devuelve error cuando la cita ya está cancelada', async () => {
    cancelAppointment.mockRejectedValue(
      Object.assign(new Error('La cita ya está cancelada'), { statusCode: 400 })
    );

    const response = await authenticatedRequest()
      .patch(`/api/appointments/${appointmentId}/cancel`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
