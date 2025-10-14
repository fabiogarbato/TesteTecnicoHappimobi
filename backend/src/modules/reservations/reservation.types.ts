import { VehicleResponse } from '../vehicles/vehicle.types';

export type ReservationStatus = 'active' | 'released';

export interface CreateReservationInput {
  vehicleId: string;
  userId: string;
}

export interface ReleaseReservationInput {
  reservationId: string;
  userId: string;
}

export interface ReservationResponse {
  id: string;
  status: ReservationStatus;
  reservedAt: Date;
  releasedAt?: Date;
  vehicle: VehicleResponse;
}
