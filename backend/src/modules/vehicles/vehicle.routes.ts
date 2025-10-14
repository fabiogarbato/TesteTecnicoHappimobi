import { Router } from 'express';

import { authGuard } from '../../middlewares/auth-guard';
import { VehicleRepository } from './vehicle.repository';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { ReservationRepository } from '../reservations';

const vehicleRepository = new VehicleRepository();
const reservationRepository = new ReservationRepository();
const vehicleService = new VehicleService(vehicleRepository, reservationRepository);
const vehicleController = new VehicleController(vehicleService);

export const vehicleRouter = Router();

vehicleRouter.use(authGuard);

vehicleRouter.post('/', vehicleController.create);
vehicleRouter.get('/', vehicleController.list);
vehicleRouter.put('/:id', vehicleController.update);
vehicleRouter.delete('/:id', vehicleController.remove);
