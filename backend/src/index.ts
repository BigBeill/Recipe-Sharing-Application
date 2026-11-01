import { app } from './app';
import { imagesService } from './container';
import { connectMongoose, disconnectMongoose } from './externalResources/database/mongoose/config.mongooseDatabase';
import postgresConnection from './externalResources/database/postgres/config.postgreDatabase';
import imageGarbageCollection from './features/images/application/images.garbageCollection';
import { env } from './global/config/env.config';

await connectMongoose();
await postgresConnection.connect();

const server = app.listen(env.PORT);
const stopImageGarbageCollection = imageGarbageCollection(imagesService);
console.log( `Server running at http://${server.server?.hostname}:${server.server?.port}`);

const shutdown = async () => {
  console.log('Shutting down...');
  stopImageGarbageCollection();
  await server.stop();
  await disconnectMongoose();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);