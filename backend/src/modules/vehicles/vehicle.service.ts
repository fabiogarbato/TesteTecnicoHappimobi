import { HttpError } from '../../errors/http-error';
import { VehicleRepository } from './vehicle.repository';
import { CreateVehicleInput, UpdateVehicleInput, VehicleResponse } from './vehicle.types';
import { toVehicleResponse } from './vehicle.mapper';
import { ReservationRepository } from '../reservations';

export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async createVehicle(data: CreateVehicleInput): Promise<VehicleResponse> {
    const normalizedPlate = data.licensePlate.toUpperCase();
    const existing = await this.vehicleRepository.findByLicensePlate(normalizedPlate);

    if (existing) {
      throw new HttpError(409, 'Placa já cadastrada');
    }

    const vehicle = await this.vehicleRepository.create({
      ...data,
      licensePlate: normalizedPlate,
    });

    return toVehicleResponse(vehicle);
  }

  async listVehicles(): Promise<VehicleResponse[]> {
    const vehicles = await this.vehicleRepository.findAll();
    return vehicles.map(toVehicleResponse);
  }

  async updateVehicle(id: string, payload: UpdateVehicleInput): Promise<VehicleResponse> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new HttpError(404, 'Veículo não encontrado');
    }

    if (payload.licensePlate) {
      const normalizedPlate = payload.licensePlate.toUpperCase();

      if (normalizedPlate !== vehicle.licensePlate) {
        const existing = await this.vehicleRepository.findByLicensePlate(normalizedPlate);

        if (existing && existing.id !== id) {
          throw new HttpError(409, 'Placa já cadastrada');
        }

        vehicle.licensePlate = normalizedPlate;
      }
    }

    if (payload.name) {
      vehicle.name = payload.name;
    }

    if (payload.brand) {
      vehicle.brand = payload.brand;
    }

    if (payload.modelName) {
      vehicle.modelName = payload.modelName;
    }

    if (payload.year) {
      vehicle.year = payload.year;
    }

    if (payload.color !== undefined) {
      vehicle.color = payload.color;
    }

    if (payload.category !== undefined) {
      vehicle.category = payload.category;
    }

    if (payload.engine !== undefined) {
      vehicle.engine = payload.engine;
    }

    if (payload.size !== undefined) {
      vehicle.size = payload.size;
    }

    const updated = await vehicle.save();
    return toVehicleResponse(updated);
  }

  async deleteVehicle(id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new HttpError(404, 'Veículo não encontrado');
    }

    const activeReservation = await this.reservationRepository.findActiveByVehicle(id);

    if (vehicle.status === 'reserved' || activeReservation) {
      throw new HttpError(409, 'Veículo reservado não pode ser removido');
    }

    await this.vehicleRepository.deleteById(id);
  }
}
