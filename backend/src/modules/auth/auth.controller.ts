import { Request, Response, NextFunction } from 'express';

import { AuthService } from './auth.service';
import {
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegisterInput,
  validateResetPasswordInput,
} from './auth.validators';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const credentials = validateLoginInput(req.body);
      const result = await this.authService.login(credentials);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = validateRegisterInput(req.body);
      const result = await this.authService.register(payload);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = validateForgotPasswordInput(req.body);
      const result = await this.authService.requestPasswordReset(payload.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = validateResetPasswordInput(req.body);
      const result = await this.authService.resetPassword(payload.token, payload.password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
