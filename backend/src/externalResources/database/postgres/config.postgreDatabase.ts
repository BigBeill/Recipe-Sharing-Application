import { Pool } from 'pg';
import { env } from '../../../global/config/env.config';

const postgresConnection = new Pool({
   host: env.POSTGRES_HOST,
   user: env.POSTGRES_USER,
   database: env.POSTGRES_DB,
   password: env.POSTGRES_PASSWORD,
   port: env.POSTGRES_PORT,
});

postgresConnection.connect((error, client, release) => {
  if (error) {
    console.error('Server failed to connect to PostgreSQL database: ', error.stack);
    return;
  }
  console.log('Connected to PostgreSQL');
  release();
});

postgresConnection.on('error', (error) => {
  console.error('PostgreSQL pool client error:', error.message);
});

export default postgresConnection;