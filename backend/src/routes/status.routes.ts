import { Router } from 'express';

import { mongoConnection } from '../config/mongo';

const connectionStates: Record<number, string> = {
  0: 'desconectado',
  1: 'conectado',
  2: 'conectando',
  3: 'desconectando',
};

export const statusRouter = Router();

statusRouter.get('/status', (_req, res) => {
  const readyState = mongoConnection().readyState;
  const database = connectionStates[readyState] ?? 'desconhecido';

  res.json({
    api: 'ok',
    database,
  });
});
