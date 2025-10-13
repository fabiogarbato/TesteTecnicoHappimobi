import { Router } from 'express';

import { statusRouter } from './status.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { userRouter } from '../modules/users/user.routes';

export const router = Router();

router.use(statusRouter);
router.use(authRouter);
router.use('/users', userRouter);
