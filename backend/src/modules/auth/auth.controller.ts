import { Request, Response, NextFunction } from 'express';

import { AuthService } from './auth.service';
import { validateLoginInput } from './auth.validators';

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
}
