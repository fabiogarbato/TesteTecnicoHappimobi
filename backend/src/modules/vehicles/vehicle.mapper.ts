import { VehicleDocument } from './vehicle.schema';
import { VehicleResponse } from './vehicle.types';

export const toVehicleResponse = (vehicle: VehicleDocument): VehicleResponse => ({
  id: vehicle.id,
  name: vehicle.name,
  brand: vehicle.brand,
  modelName: vehicle.modelName,
  year: vehicle.year,
  licensePlate: vehicle.licensePlate,
  color: vehicle.color ?? undefined,
  type: vehicle.category ?? undefined,
  engine: vehicle.engine ?? undefined,
  size: vehicle.size ?? undefined,
  status: vehicle.status,
  createdAt: vehicle.createdAt,
  updatedAt: vehicle.updatedAt,
});
