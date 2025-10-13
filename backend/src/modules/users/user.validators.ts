import { HttpError } from '../../errors/http-error';
import { CreateUserInput, UpdateUserInput } from './user.types';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isOptionalString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const validateCreateUserInput = (payload: unknown): CreateUserInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { name, email, password } = payload as Partial<CreateUserInput>;

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

export const validateUpdateUserInput = (payload: unknown): UpdateUserInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { name, email, password } = payload as Partial<UpdateUserInput>;

  const updateData: UpdateUserInput = {};

  if (name !== undefined) {
    if (!isOptionalString(name)) {
      throw new HttpError(400, 'Nome deve ser uma string não vazia');
    }
    updateData.name = name;
  }

  if (email !== undefined) {
    if (!isOptionalString(email)) {
      throw new HttpError(400, 'E-mail deve ser uma string não vazia');
    }
    updateData.email = email;
  }

  if (password !== undefined) {
    if (!isOptionalString(password)) {
      throw new HttpError(400, 'Senha deve ser uma string não vazia');
    }
    updateData.password = password;
  }

  if (Object.keys(updateData).length === 0) {
    throw new HttpError(400, 'Nenhum campo para atualizar');
  }

  return updateData;
};
