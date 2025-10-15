import { HttpError } from '../../errors/http-error';
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.types';

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

export const validateForgotPasswordInput = (payload: unknown): ForgotPasswordInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { email } = payload as Partial<ForgotPasswordInput>;

  if (!isNonEmptyString(email)) {
    throw new HttpError(400, 'E-mail é obrigatório');
  }

  return { email };
};

export const validateResetPasswordInput = (payload: unknown): ResetPasswordInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { token, password } = payload as Partial<ResetPasswordInput>;

  if (!isNonEmptyString(token)) {
    throw new HttpError(400, 'Token é obrigatório');
  }

  if (!isNonEmptyString(password)) {
    throw new HttpError(400, 'Senha é obrigatória');
  }

  return {
    token,
    password,
  };
};
