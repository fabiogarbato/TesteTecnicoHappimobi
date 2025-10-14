import { Request, Response, NextFunction } from 'express';

import { VehicleService } from './vehicle.service';
import {
  validateCreateVehicleInput,
  validateUpdateVehicleInput,
} from './vehicle.validators';

export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = validateCreateVehicleInput(req.body);
      const vehicle = await this.vehicleService.createVehicle(payload);
      res.status(201).json(vehicle);
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicles = await this.vehicleService.listVehicles();
      res.json(vehicles);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payload = validateUpdateVehicleInput(req.body);
      const vehicle = await this.vehicleService.updateVehicle(id, payload);
      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.vehicleService.deleteVehicle(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
