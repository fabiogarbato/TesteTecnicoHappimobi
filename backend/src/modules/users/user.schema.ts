import { Schema, model, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const transformed = ret as unknown as Record<string, unknown>;

    transformed.id = String(ret._id);

    Reflect.deleteProperty(transformed, '_id');
    Reflect.deleteProperty(transformed, '__v');
    Reflect.deleteProperty(transformed, 'password');

    return transformed;
  },
});

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
