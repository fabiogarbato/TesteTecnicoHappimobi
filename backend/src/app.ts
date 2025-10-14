import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { router as appRouter } from './routes';
import { errorHandler } from './middlewares/error-handler';
import { swaggerSpec } from './docs/swagger';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(appRouter);

  app.use(errorHandler);

  return app;
};
