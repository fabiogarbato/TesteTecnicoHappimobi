import { Schema, model, Document, Model } from 'mongoose';

import { VehicleStatus } from './vehicle.types';

export interface VehicleDocument extends Document {
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

const vehicleSchema = new Schema<VehicleDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  },
);

vehicleSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const transformed = ret as unknown as Record<string, unknown>;

    transformed.id = String(ret._id);

    Reflect.deleteProperty(transformed, '_id');
    Reflect.deleteProperty(transformed, '__v');

    return transformed;
  },
});

export const VehicleModel: Model<VehicleDocument> = model<VehicleDocument>('Vehicle', vehicleSchema);
