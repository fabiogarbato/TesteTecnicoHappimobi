import { Schema, model, Document, Model, Types } from 'mongoose';

import { ReservationStatus } from './reservation.types';

export interface ReservationDocument extends Document {
  user: Types.ObjectId;
  vehicle: Types.ObjectId;
  status: ReservationStatus;
  reservedAt: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<ReservationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'released'],
      default: 'active',
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    releasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

reservationSchema.index(
  { vehicle: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } },
);

reservationSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } },
);

reservationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const transformed = ret as unknown as Record<string, unknown>;

    transformed.id = String(ret._id);

    Reflect.deleteProperty(transformed, '_id');
    Reflect.deleteProperty(transformed, '__v');

    return transformed;
  },
});

export const ReservationModel: Model<ReservationDocument> = model<ReservationDocument>(
  'Reservation',
  reservationSchema,
);
