import { HttpError } from '../../errors/http-error';

interface ReservePayload {
  vehicleId: string;
}

export const validateReservePayload = (payload: unknown): ReservePayload => {
  if (typeof payload !== 'object' || payload === null) {
    throw new HttpError(400, 'Payload inválido');
  }

  const { vehicleId } = payload as Partial<ReservePayload>;

  if (typeof vehicleId !== 'string' || vehicleId.trim().length === 0) {
    throw new HttpError(400, 'ID do veículo é obrigatório');
  }

  return { vehicleId };
};
