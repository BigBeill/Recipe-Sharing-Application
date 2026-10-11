import { cors } from '@elysiajs/cors';
import { env } from './env.config';

export const corsConfig = cors({
  origin: env.FRONTEND_URLS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});