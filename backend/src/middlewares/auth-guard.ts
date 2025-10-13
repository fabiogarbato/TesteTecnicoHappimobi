import { Request, Response, NextFunction } from 'express';

import { HttpError } from '../errors/http-error';
import { verifyAccessToken } from '../modules/auth/token.service';

export const authGuard = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new HttpError(401, 'Token de autorização não informado'));
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new HttpError(401, 'Formato de token inválido'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error instanceof Error ? error : new HttpError(401, 'Token inválido ou expirado'));
  }
};
