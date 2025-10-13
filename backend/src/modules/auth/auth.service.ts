import bcrypt from 'bcrypt';

import { HttpError } from '../../errors/http-error';
import { UserRepository } from '../users/user.repository';
import { toUserResponse } from '../users/user.mapper';
import { LoginInput, LoginResponse } from './auth.types';
import { signAccessToken } from './token.service';

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
}
