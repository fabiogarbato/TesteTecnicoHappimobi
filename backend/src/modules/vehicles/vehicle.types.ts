export type VehicleStatus = 'available' | 'reserved';

export interface CreateVehicleInput {
  name: string;
  brand: string;
  modelName: string;
  year: number;
  licensePlate: string;
  color?: string;
}

export interface UpdateVehicleInput {
  name?: string;
  brand?: string;
  modelName?: string;
  year?: number;
  licensePlate?: string;
  color?: string;
}

export interface VehicleResponse {
  id: string;
  name: string;
  brand: string;
  modelName: string;
  year: number;
  licensePlate: string;
  color?: string;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
}
