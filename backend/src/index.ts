import { app } from './app';
import { connectMongoose, disconnectMongoose } from './externalResources/database/mongo/config.mongoDatabase';
import postgresConnection from './externalResources/database/postgre/config.postgreDatabase';
import { env } from './global/config/env.config';

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