import { Types } from 'mongoose';

import { ReservationModel, ReservationDocument } from './reservation.schema';

export class ReservationRepository {
  async create(userId: string, vehicleId: string): Promise<ReservationDocument> {
    const reservation = new ReservationModel({
      user: new Types.ObjectId(userId),
      vehicle: new Types.ObjectId(vehicleId),
    });

    return reservation.save();
  }

  async findActiveByVehicle(vehicleId: string): Promise<ReservationDocument | null> {
    return ReservationModel.findOne({ vehicle: vehicleId, status: 'active' }).exec();
  }

  async findActiveByUser(userId: string): Promise<ReservationDocument | null> {
    return ReservationModel.findOne({ user: userId, status: 'active' }).exec();
  }

  async findById(id: string): Promise<ReservationDocument | null> {
    return ReservationModel.findById(id).exec();
  }

  async findByIdWithVehicle(id: string): Promise<ReservationDocument | null> {
    return ReservationModel.findById(id).populate('vehicle').exec();
  }

  async findUserReservations(userId: string): Promise<ReservationDocument[]> {
    return ReservationModel.find({ user: userId })
      .sort({ reservedAt: -1 })
      .populate('vehicle')
      .exec();
  }

  async save(reservation: ReservationDocument): Promise<ReservationDocument> {
    return reservation.save();
  }
}
