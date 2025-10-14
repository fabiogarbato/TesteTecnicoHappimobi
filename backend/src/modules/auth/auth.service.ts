import bcrypt from 'bcrypt';

import { HttpError } from '../../errors/http-error';
import { UserRepository } from '../users/user.repository';
import { toUserResponse } from '../users/user.mapper';
import { LoginInput, LoginResponse, RegisterInput } from './auth.types';
import { signAccessToken } from './token.service';

const SALT_ROUNDS = 10;

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(credentials: LoginInput): Promise<LoginResponse> {
    const email = credentials.email.toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new HttpError(401, 'Credenciais inválidas');
    }

    const passwordMatches = await bcrypt.compare(credentials.password, user.password);

    if (!passwordMatches) {
      throw new HttpError(401, 'Credenciais inválidas');
    }

    const token = signAccessToken({ sub: user.id, email: user.email });
    const userResponse = toUserResponse(user);

    return {
      token,
      user: {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
      },
    };
  }

  async register(payload: RegisterInput): Promise<LoginResponse> {
    const normalizedEmail = payload.email.toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new HttpError(409, 'E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

    const createdUser = await this.userRepository.create({
      name: payload.name,
      email: normalizedEmail,
      password: passwordHash,
    });

    const token = signAccessToken({ sub: createdUser.id, email: createdUser.email });
    const userResponse = toUserResponse(createdUser);

    return {
      token,
      user: {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
      },
    };
  }
}
