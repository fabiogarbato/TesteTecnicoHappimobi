import { HttpError } from '../../errors/http-error';
import { CreateVehicleInput, UpdateVehicleInput } from './vehicle.types';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isOptionalString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const parseYear = (value: unknown): number => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '' && Number.isInteger(Number(value))) {
    return Number(value);
  }

  throw new HttpError(400, 'Ano deve ser um número inteiro');
};

const ensureValidYear = (year: number): number => {
  if (year < 1900) {
    throw new HttpError(400, 'Ano deve ser igual ou posterior a 1900');
  }

  return year;
};

export const validateCreateVehicleInput = (payload: unknown): CreateVehicleInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { name, brand, modelName, year, licensePlate, color } = payload as Partial<CreateVehicleInput> & {
    year?: unknown;
  };

  if (!isNonEmptyString(name)) {
    throw new HttpError(400, 'Nome é obrigatório');
  }

  if (!isNonEmptyString(brand)) {
    throw new HttpError(400, 'Marca é obrigatória');
  }

  if (!isNonEmptyString(modelName)) {
    throw new HttpError(400, 'Modelo é obrigatório');
  }

  if (!isNonEmptyString(licensePlate)) {
    throw new HttpError(400, 'Placa é obrigatória');
  }

  const parsedYear = ensureValidYear(parseYear(year));

  const normalizedPlate = licensePlate.toUpperCase();

  return {
    name,
    brand,
    modelName,
    year: parsedYear,
    licensePlate: normalizedPlate,
    color: isNonEmptyString(color) ? color : undefined,
  };
};

export const validateUpdateVehicleInput = (payload: unknown): UpdateVehicleInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { name, brand, modelName, year, licensePlate, color } = payload as Partial<UpdateVehicleInput> & {
    year?: unknown;
  };

  const update: UpdateVehicleInput = {};

  if (name !== undefined) {
    if (!isOptionalString(name)) {
      throw new HttpError(400, 'Nome deve ser uma string não vazia');
    }
    update.name = name;
  }

  if (brand !== undefined) {
    if (!isOptionalString(brand)) {
      throw new HttpError(400, 'Marca deve ser uma string não vazia');
    }
    update.brand = brand;
  }

  if (modelName !== undefined) {
    if (!isOptionalString(modelName)) {
      throw new HttpError(400, 'Modelo deve ser uma string não vazia');
    }
    update.modelName = modelName;
  }

  if (licensePlate !== undefined) {
    if (!isOptionalString(licensePlate)) {
      throw new HttpError(400, 'Placa deve ser uma string não vazia');
    }
    update.licensePlate = licensePlate.toUpperCase();
  }

  if (year !== undefined) {
    update.year = ensureValidYear(parseYear(year));
  }

  if (color !== undefined) {
    if (!isOptionalString(color)) {
      throw new HttpError(400, 'Cor deve ser uma string não vazia');
    }
    update.color = color;
  }

  if (Object.keys(update).length === 0) {
    throw new HttpError(400, 'Nenhum campo para atualizar');
  }

  return update;
};
