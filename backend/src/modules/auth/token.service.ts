import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env';
import { HttpError } from '../../errors/http-error';

export interface TokenPayload {
  sub: string;
  email: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.jwt.secret as Secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.jwt.secret as Secret) as JwtPayload & TokenPayload;

    if (!decoded.sub || !decoded.email) {
      throw new Error('Missing token payload');
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
    };
  } catch {
    throw new HttpError(401, 'Token inválido ou expirado');
  }
};
