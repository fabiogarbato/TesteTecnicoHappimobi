import express, { Application } from 'express';
import cors from 'cors';

import { router as appRouter } from './routes';
import { errorHandler } from './middlewares/error-handler';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(appRouter);

  app.use(errorHandler);

  return app;
};
