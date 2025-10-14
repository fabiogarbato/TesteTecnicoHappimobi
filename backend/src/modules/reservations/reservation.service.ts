import { HttpError } from '../../errors/http-error';
import { VehicleRepository } from '../vehicles/vehicle.repository';
import { ReservationRepository } from './reservation.repository';
import { ReservationResponse } from './reservation.types';
import { toReservationResponse } from './reservation.mapper';

export class ReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async reserveVehicle(userId: string, vehicleId: string): Promise<ReservationResponse> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new HttpError(404, 'Veículo não encontrado');
    }

    const existingReservationForUser = await this.reservationRepository.findActiveByUser(userId);

    if (existingReservationForUser) {
      throw new HttpError(409, 'Usuário já possui um veículo reservado');
    }

    const vehicleReservation = await this.reservationRepository.findActiveByVehicle(vehicleId);

    if (vehicleReservation || vehicle.status === 'reserved') {
      throw new HttpError(409, 'Veículo já está reservado');
    }

    const lockedVehicle = await this.vehicleRepository.markAsReserved(vehicleId);

    if (!lockedVehicle) {
      throw new HttpError(409, 'Veículo já está reservado');
    }

    try {
      const reservation = await this.reservationRepository.create(userId, vehicleId);
      await reservation.populate('vehicle');
      return toReservationResponse(reservation);
    } catch (error) {
      await this.vehicleRepository.markAsAvailable(vehicleId);
      throw error;
    }
  }

  async releaseReservation(reservationId: string, userId: string): Promise<ReservationResponse> {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new HttpError(404, 'Reserva não encontrada');
    }

    if (String(reservation.user) !== userId) {
      throw new HttpError(403, 'Reserva não pertence ao usuário autenticado');
    }

    if (reservation.status !== 'active') {
      throw new HttpError(409, 'Reserva já foi encerrada');
    }

    reservation.status = 'released';
    reservation.releasedAt = new Date();

    const savedReservation = await this.reservationRepository.save(reservation);

    await this.vehicleRepository.markAsAvailable(String(reservation.vehicle));
    await savedReservation.populate('vehicle');

    return toReservationResponse(savedReservation);
  }

  async listUserReservations(userId: string): Promise<ReservationResponse[]> {
    const reservations = await this.reservationRepository.findUserReservations(userId);
    return reservations.map(toReservationResponse);
  }

  async getActiveReservationByUser(userId: string): Promise<ReservationResponse | null> {
    const reservation = await this.reservationRepository.findActiveByUser(userId);

    if (!reservation) {
      return null;
    }

    await reservation.populate('vehicle');
    return toReservationResponse(reservation);
  }
}
