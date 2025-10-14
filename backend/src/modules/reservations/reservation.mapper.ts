import { VehicleDocument } from '../vehicles/vehicle.schema';
import { toVehicleResponse } from '../vehicles/vehicle.mapper';
import { ReservationDocument } from './reservation.schema';
import { ReservationResponse } from './reservation.types';

export const toReservationResponse = (
  reservation: ReservationDocument,
): ReservationResponse => {
  const vehicleDocument = reservation.vehicle as unknown as VehicleDocument;

  return {
    id: reservation.id,
    status: reservation.status,
    reservedAt: reservation.reservedAt,
    releasedAt: reservation.releasedAt ?? undefined,
    vehicle: toVehicleResponse(vehicleDocument),
  };
};
