import { Request, Response, NextFunction } from 'express';

import { HttpError } from '../../errors/http-error';
import { ReservationService } from './reservation.service';
import { validateReservePayload } from './reservation.validators';

export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  reserve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const payload = validateReservePayload(req.body);
      const reservation = await this.reservationService.reserveVehicle(req.user.id, payload.vehicleId);
      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  };

  release = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const { id } = req.params;
      const reservation = await this.reservationService.releaseReservation(id, req.user.id);
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  };

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const reservations = await this.reservationService.listUserReservations(req.user.id);
      res.json(reservations);
    } catch (error) {
      next(error);
    }
  };
}
