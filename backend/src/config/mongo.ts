import mongoose from 'mongoose';

import { env } from './env';

mongoose.set('strictQuery', true);

export const connectMongo = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Falha ao conectar no MongoDB', error);
    throw error;
  }
};

export const mongoConnection = () => mongoose.connection;
