import bcrypt from 'bcrypt';

import { UserRepository } from './user.repository';

interface SeedOptions {
  name: string;
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

export const seedAdminUser = async (
  repository: UserRepository,
  options: SeedOptions,
): Promise<void> => {
  const email = options.email.toLowerCase();
  const existing = await repository.findByEmail(email);

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(options.password, SALT_ROUNDS);

  await repository.create({
    name: options.name,
    email,
    password: passwordHash,
  });
};

export const getSeedConfig = (): SeedOptions => {
  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'Variáveis de seed do usuário admin não configuradas (SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD)',
    );
  }

  return { name, email, password };
};
