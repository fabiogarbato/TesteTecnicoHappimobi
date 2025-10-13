import { Request, Response, NextFunction } from 'express';

import { UserService } from './user.service';
import {
  validateCreateUserInput,
  validateUpdateUserInput,
} from './user.validators';

export class UserController {
  constructor(private readonly userService: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = validateCreateUserInput(req.body);
      const user = await this.userService.createUser(payload);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.listUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payload = validateUpdateUserInput(req.body);
      const user = await this.userService.updateUser(id, payload);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
