import { VehicleModel, VehicleDocument } from './vehicle.schema';
import { CreateVehicleInput, UpdateVehicleInput } from './vehicle.types';

export class VehicleRepository {
  async create(data: CreateVehicleInput): Promise<VehicleDocument> {
    const vehicle = new VehicleModel(data);
    return vehicle.save();
  }

  async findById(id: string): Promise<VehicleDocument | null> {
    return VehicleModel.findById(id).exec();
  }

  async findByLicensePlate(licensePlate: string): Promise<VehicleDocument | null> {
    return VehicleModel.findOne({ licensePlate }).exec();
  }

  async findAll(): Promise<VehicleDocument[]> {
    return VehicleModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateById(id: string, data: UpdateVehicleInput): Promise<VehicleDocument | null> {
    return VehicleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<VehicleDocument | null> {
    return VehicleModel.findByIdAndDelete(id).exec();
  }

  async markAsReserved(id: string): Promise<VehicleDocument | null> {
    return VehicleModel.findOneAndUpdate(
      { _id: id, status: 'available' },
      { status: 'reserved' },
      { new: true },
    ).exec();
  }

  async markAsAvailable(id: string): Promise<VehicleDocument | null> {
    return VehicleModel.findOneAndUpdate(
      { _id: id, status: 'reserved' },
      { status: 'available' },
      { new: true },
    ).exec();
  }
}
