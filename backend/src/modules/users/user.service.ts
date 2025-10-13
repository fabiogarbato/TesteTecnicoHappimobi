import bcrypt from 'bcrypt';

import { HttpError } from '../../errors/http-error';
import { UserRepository } from './user.repository';
import { CreateUserInput, UpdateUserInput, UserResponse } from './user.types';
import { toUserResponse } from './user.mapper';

const SALT_ROUNDS = 10;

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async createUser(data: CreateUserInput): Promise<UserResponse> {
    const normalizedEmail = data.email.toLowerCase();
    const existingUser = await this.repository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new HttpError(409, 'E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const createdUser = await this.repository.create({
      name: data.name,
      email: normalizedEmail,
      password: passwordHash,
    });

    return toUserResponse(createdUser);
  }

  async listUsers(): Promise<UserResponse[]> {
    const users = await this.repository.findAll();
    return users.map(toUserResponse);
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<UserResponse> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado');
    }

    if (data.email && data.email.toLowerCase() !== user.email) {
      const existing = await this.repository.findByEmail(data.email.toLowerCase());
      if (existing && existing.id !== id) {
        throw new HttpError(409, 'E-mail já cadastrado');
      }
      user.email = data.email.toLowerCase();
    }

    if (data.name) {
      user.name = data.name;
    }

    if (data.password) {
      user.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const updatedUser = await user.save();
    return toUserResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.repository.deleteById(id);

    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado');
    }
  }

  async findByEmail(email: string) {
    return this.repository.findByEmail(email.toLowerCase());
  }
}
