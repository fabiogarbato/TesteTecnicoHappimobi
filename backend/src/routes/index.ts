import { Router } from 'express';

import { statusRouter } from './status.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { userRouter } from '../modules/users/user.routes';
import { vehicleRouter } from '../modules/vehicles/vehicle.routes';
import { reservationRouter } from '../modules/reservations/reservation.routes';

export const router = Router();

router.use(statusRouter);
router.use(authRouter);
router.use('/users', userRouter);
router.use('/vehicles', vehicleRouter);
router.use('/reservations', reservationRouter);
