import { HttpError } from '../../errors/http-error';
import { LoginInput, RegisterInput } from './auth.types';

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

export const validateRegisterInput = (payload: unknown): RegisterInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { name, email, password } = payload as Partial<RegisterInput>;

  if (!isNonEmptyString(name)) {
    throw new HttpError(400, 'Nome é obrigatório');
  }

  if (!isNonEmptyString(email)) {
    throw new HttpError(400, 'E-mail é obrigatório');
  }

  if (!isNonEmptyString(password)) {
    throw new HttpError(400, 'Senha é obrigatória');
  }

  return {
    name,
    email,
    password,
  };
};
