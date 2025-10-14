import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { createApp } from '../src/app';
import { connectMongo } from '../src/config/mongo';
import { env } from '../src/config/env';
import { UserRepository, seedAdminUser } from '../src/modules/users';

const adminCredentials = {
  name: 'Administrador de Teste',
  email: 'admin@test.com',
  password: 'Admin123',
};

describe('Vehicles & Reservations API', () => {
  let mongoServer: MongoMemoryServer;
  const repository = new UserRepository();
  const app = createApp();

  const seedAdmin = async () => {
    await seedAdminUser(repository, adminCredentials);
  };

  const authenticate = async (): Promise<string> => {
    const response = await request(app).post('/login').send({
      email: adminCredentials.email,
      password: adminCredentials.password,
    });

    expect(response.status).toBe(200);
    return response.body.token as string;
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    (env as unknown as { mongoUri: string }).mongoUri = mongoServer.getUri();

    await connectMongo();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Conexão com o MongoDB não foi inicializada');
    }

    await db.dropDatabase();
    await seedAdmin();
  });

  const createVehiclePayload = (overrides: Partial<{ name: string; brand: string; modelName: string; year: number; licensePlate: string; color?: string }> = {}) => ({
    name: 'Onix LT 1.0',
    brand: 'Chevrolet',
    modelName: 'Hatch',
    year: 2024,
    licensePlate: 'ABC1D23',
    color: 'Branco',
    ...overrides,
  });

  it('should create, list and update vehicles', async () => {
    const token = await authenticate();

    const createResponse = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(createVehiclePayload());

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      name: 'Onix LT 1.0',
      brand: 'Chevrolet',
      modelName: 'Hatch',
      licensePlate: 'ABC1D23',
      status: 'available',
    });

    const listResponse = await request(app)
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);

    const vehicleId = createResponse.body.id as string;

    const updateResponse = await request(app)
      .put(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ color: 'Preto', modelName: 'Hatch Premier' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      color: 'Preto',
      modelName: 'Hatch Premier',
    });
  });

  it('should prevent duplicated license plates', async () => {
    const token = await authenticate();

    await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(createVehiclePayload());

    const duplicateResponse = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(createVehiclePayload({ name: 'Outro Carro', brand: 'VW' }));

    expect(duplicateResponse.status).toBe(409);
  });

  it('should handle reservations respecting business rules', async () => {
    const token = await authenticate();

    const firstVehicleResponse = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(createVehiclePayload());

    const secondVehicleResponse = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(createVehiclePayload({
        name: 'Tracker LTZ',
        licensePlate: 'DEF2G34',
      }));

    const firstVehicleId = firstVehicleResponse.body.id as string;
    const secondVehicleId = secondVehicleResponse.body.id as string;

    const reserveResponse = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ vehicleId: firstVehicleId });

    expect(reserveResponse.status).toBe(201);
    expect(reserveResponse.body).toMatchObject({
      status: 'active',
      vehicle: { id: firstVehicleId, status: 'reserved' },
    });

    const duplicateVehicleReservation = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ vehicleId: firstVehicleId });

    expect(duplicateVehicleReservation.status).toBe(409);

    const otherVehicleReservation = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ vehicleId: secondVehicleId });

    expect(otherVehicleReservation.status).toBe(409);

    const listMineResponse = await request(app)
      .get('/reservations/me')
      .set('Authorization', `Bearer ${token}`);

    expect(listMineResponse.status).toBe(200);
    expect(listMineResponse.body).toHaveLength(1);

    const reservationId = reserveResponse.body.id as string;

    const releaseResponse = await request(app)
      .post(`/reservations/${reservationId}/release`)
      .set('Authorization', `Bearer ${token}`);

    expect(releaseResponse.status).toBe(200);
    expect(releaseResponse.body).toMatchObject({
      status: 'released',
      vehicle: { id: firstVehicleId, status: 'available' },
    });

    const reserveAfterRelease = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ vehicleId: secondVehicleId });

    expect(reserveAfterRelease.status).toBe(201);

    const deleteReservedVehicle = await request(app)
      .delete(`/vehicles/${secondVehicleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteReservedVehicle.status).toBe(409);

    const releaseSecondReservation = await request(app)
      .post(`/reservations/${reserveAfterRelease.body.id}/release`)
      .set('Authorization', `Bearer ${token}`);

    expect(releaseSecondReservation.status).toBe(200);

    const deleteAfterRelease = await request(app)
      .delete(`/vehicles/${secondVehicleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteAfterRelease.status).toBe(204);

    const reservationsAfterDelete = await request(app)
      .get('/reservations/me')
      .set('Authorization', `Bearer ${token}`);

    expect(reservationsAfterDelete.status).toBe(200);
  });
});
