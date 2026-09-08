import { cors } from '@elysiajs/cors';
import { env } from './env';

export const corsConfig = cors({
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});