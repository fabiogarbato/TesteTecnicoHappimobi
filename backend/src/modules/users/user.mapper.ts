import { UserDocument } from './user.schema';
import { UserResponse } from './user.types';

export const toUserResponse = (user: UserDocument): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
