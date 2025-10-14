import { Router } from 'express';

import { authGuard } from '../../middlewares/auth-guard';
import { ReservationRepository } from './reservation.repository';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { VehicleRepository } from '../vehicles/vehicle.repository';

const reservationRepository = new ReservationRepository();
const vehicleRepository = new VehicleRepository();
const reservationService = new ReservationService(reservationRepository, vehicleRepository);
const reservationController = new ReservationController(reservationService);

export const reservationRouter = Router();

reservationRouter.use(authGuard);

reservationRouter.post('/', reservationController.reserve);
reservationRouter.post('/:id/release', reservationController.release);
reservationRouter.get('/me', reservationController.listMine);
