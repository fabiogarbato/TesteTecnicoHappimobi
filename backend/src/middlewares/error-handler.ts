import { Request, Response, NextFunction } from 'express';

import { HttpError } from '../errors/http-error';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isHttpError = error instanceof HttpError;
  const status = isHttpError ? error.statusCode : 500;
  const payload = {
    message: error.message ?? 'Internal server error',
    details: isHttpError ? error.details : undefined,
  };

  if (status >= 500) {
    console.error(error);
  }

  if (res.headersSent) {
    return;
  }

  res.status(status).json(payload);
};
