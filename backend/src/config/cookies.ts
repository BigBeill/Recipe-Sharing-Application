import { env } from './env';

const isProduction = env.NODE_ENVIRONMENT === 'production';

export const cookieConfig = {
   httpOnly: true,
   secure: isProduction,
   sameSite: isProduction ? 'none' : 'lax',
   path: '/',
   domain: env.COOKIE_DOMAIN,
} as const;