import dotenv from 'dotenv';

dotenv.config();

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Variável de ambiente ${key} não informada`);
  }

  return value;
};

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = required(process.env.MONGO_URI, 'MONGO_URI');
const JWT_SECRET = required(process.env.JWT_SECRET, 'JWT_SECRET');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const env = {
  nodeEnv: NODE_ENV,
  port: PORT,
  mongoUri: MONGO_URI,
  jwt: {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
  },
};
