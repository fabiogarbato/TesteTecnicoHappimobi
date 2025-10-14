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

describe('Auth & Users API', () => {
  let mongoServer: MongoMemoryServer;
  const repository = new UserRepository();
  const app = createApp();

  const seedAdmin = async () => {
    await seedAdminUser(repository, adminCredentials);
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    (env as unknown as { mongoUri: string }).mongoUri = mongoServer.getUri();

    await connectMongo();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Conexão com o MongoDB não foi inicializada');
    }

    await db.dropDatabase();
    await seedAdmin();
  });

  const authenticate = async () => {
    const response = await request(app).post('/login').send({
      email: adminCredentials.email,
      password: adminCredentials.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();

    return response.body.token as string;
  };

  it('should login with seeded administrator', async () => {
    const response = await request(app).post('/login').send({
      email: adminCredentials.email,
      password: adminCredentials.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user.email', adminCredentials.email);
  });

  it('should create a new user when authenticated', async () => {
    const token = await authenticate();

    const payload = {
      name: 'Usuário de Teste',
      email: 'usuario@test.com',
      password: 'Senha123',
    };

    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: payload.name,
      email: payload.email.toLowerCase(),
    });
  });

  it('should list users when authenticated', async () => {
    const token = await authenticate();

    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Outro Usuário', email: 'outro@test.com', password: 'Senha123' });

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2); // admin + novo usuário
  });

  it('should not access protected routes without token', async () => {
    const response = await request(app).get('/users');

    expect(response.status).toBe(401);
  });
});
