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
}
