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

const parseOptionalSize = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value < 1) {
      throw new HttpError(400, 'Capacidade deve ser um número inteiro positivo');
    }
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '' && Number.isInteger(Number(value))) {
    const parsed = Number(value);
    if (parsed < 1) {
      throw new HttpError(400, 'Capacidade deve ser um número inteiro positivo');
    }
    return parsed;
  }

  throw new HttpError(400, 'Capacidade deve ser um número inteiro');
};

type RawVehiclePayload = {
  name?: unknown;
  brand?: unknown;
  modelName?: unknown;
  year?: unknown;
  licensePlate?: unknown;
  color?: unknown;
  type?: unknown;
  engine?: unknown;
  size?: unknown;
};

export const validateCreateVehicleInput = (payload: unknown): CreateVehicleInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { name, brand, modelName, year, licensePlate, color, type, engine, size } = payload as RawVehiclePayload;

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
  const parsedSize = parseOptionalSize(size);

  const normalizedPlate = licensePlate.toUpperCase();

  return {
    name,
    brand,
    modelName,
    year: parsedYear,
    licensePlate: normalizedPlate,
    color: isNonEmptyString(color) ? color : undefined,
    category: isNonEmptyString(type) ? type : undefined,
    engine: isNonEmptyString(engine) ? engine : undefined,
    size: parsedSize,
  };
};

export const validateUpdateVehicleInput = (payload: unknown): UpdateVehicleInput => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { name, brand, modelName, year, licensePlate, color, type, engine, size } = payload as RawVehiclePayload;

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

  if (type !== undefined) {
    if (!isOptionalString(type)) {
      throw new HttpError(400, 'Tipo deve ser uma string não vazia');
    }
    update.category = type;
  }

  if (engine !== undefined) {
    if (!isOptionalString(engine)) {
      throw new HttpError(400, 'Motor deve ser uma string não vazia');
    }
    update.engine = engine;
  }

  if (size !== undefined) {
    update.size = parseOptionalSize(size);
  }

  if (Object.keys(update).length === 0) {
    throw new HttpError(400, 'Nenhum campo para atualizar');
  }

  return update;
};
