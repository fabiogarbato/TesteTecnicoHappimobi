export type VehicleStatus = 'available' | 'reserved';

export interface CreateVehicleInput {
  name: string;
  brand: string;
  modelName: string;
  year: number;
  licensePlate: string;
  color?: string;
  category?: string;
  engine?: string;
  size?: number;
}

export interface UpdateVehicleInput {
  name?: string;
  brand?: string;
  modelName?: string;
  year?: number;
  licensePlate?: string;
  color?: string;
  category?: string;
  engine?: string;
  size?: number;
}

export interface VehicleResponse {
  id: string;
  name: string;
  brand: string;
  modelName: string;
  year: number;
  licensePlate: string;
  color?: string;
  type?: string;
  engine?: string;
  size?: number;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
}
