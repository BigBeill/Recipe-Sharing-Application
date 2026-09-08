import { Pool } from 'pg';
import { env } from './env';

const postgresConnection = new Pool({
   host: env.POSTGRES_DB_HOST,
   user: env.POSTGRES_DB_USER,
   database: env.POSTGRES_DB_DATABASE,
   password: env.POSTGRES_DB_PASSWORD,
   port: env.POSTGRES_DB_PORT,
});

postgresConnection.connect((error, client, release) => {
  if (error) {
    console.error('Server failed to connect to PostgreSQL database: ', error.stack);
    return;
  }
  console.log('Connected to PostgreSQL');
  release();
});

export default postgresConnection;