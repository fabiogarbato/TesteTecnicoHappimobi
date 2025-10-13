import { Router } from 'express';

import { authGuard } from '../../middlewares/auth-guard';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const userRouter = Router();

userRouter.use(authGuard);

userRouter.post('/', userController.create);
userRouter.get('/', userController.list);
userRouter.put('/:id', userController.update);
userRouter.delete('/:id', userController.remove);
