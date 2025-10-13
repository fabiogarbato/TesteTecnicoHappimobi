import { connectMongo } from './config/mongo';
import { env } from './config/env';
import { createApp } from './app';
import { UserRepository, seedAdminUser, getSeedConfig } from './modules/users';

const app = createApp();

const start = async () => {
  try {
    await connectMongo();
    if (env.nodeEnv !== 'test') {
      const repository = new UserRepository();
      const seedConfig = getSeedConfig();
      await seedAdminUser(repository, seedConfig);
    }
    app.listen(env.port, () => {
      console.log(`API ouvindo na porta ${env.port}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor', error);
    process.exit(1);
  }
};

start();
