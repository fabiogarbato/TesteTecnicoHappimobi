import { Router } from 'express';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from '../users/user.repository';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post('/login', authController.login);
