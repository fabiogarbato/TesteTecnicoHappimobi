import { UserModel, UserDocument } from './user.schema';
import { CreateUserInput, UpdateUserInput } from './user.types';

export class UserRepository {
  async create(data: CreateUserInput & { password: string }): Promise<UserDocument> {
    const user = new UserModel(data);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }

  async updateById(id: string, data: UpdateUserInput): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndDelete(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return UserModel.find().sort({ createdAt: -1 }).exec();
  }

  async setResetPasswordToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        resetPasswordToken: token,
        resetPasswordExpiresAt: expiresAt,
      },
      { new: true },
    ).exec();
  }

  async clearResetPasswordToken(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
      { new: true },
    ).exec();
  }
}
