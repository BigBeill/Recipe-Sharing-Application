import { app } from './app';
import { env } from './config/env';
import { connectMongoose, disconnectMongoose } from './config/mongoose.database';
import postgresConnection from './config/postgres.database';

await connectMongoose();
await postgresConnection.connect();

const server = app.listen(env.PORT);
console.log( `Server running at http://${server.server?.hostname}:${server.server?.port}`);

const shutdown = async () => {
  console.log('Shutting down...');
  await server.stop();
  await disconnectMongoose();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);