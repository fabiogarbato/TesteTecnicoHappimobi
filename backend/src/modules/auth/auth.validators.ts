import { HttpError } from '../../errors/http-error';
import { LoginInput } from './auth.types';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const validateLoginInput = (payload: unknown): LoginInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { email, password } = payload as Partial<LoginInput>;

  if (!isNonEmptyString(email)) {
    throw new HttpError(400, 'E-mail é obrigatório');
  }

  if (!isNonEmptyString(password)) {
    throw new HttpError(400, 'Senha é obrigatória');
  }

  return {
    email,
    password,
  };
};
