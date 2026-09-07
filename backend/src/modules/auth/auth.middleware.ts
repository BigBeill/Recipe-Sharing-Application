// src/modules/auth/auth.middleware.ts
import { Elysia } from 'elysia';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../common/types/error.types';
import { jwtVerify } from 'jose';
import { publicKey } from './keys';

export const authenticateMiddleware = new Elysia({ name: 'authenticate' }).derive(
   { as: 'scoped' },
   async ({ cookie: { accessToken } }): Promise<{ authId?: string }> => {
      const token = accessToken?.value as string;
      if (!token) { return { authId: undefined } }
      
      try {
         const { payload } = await jwtVerify(token, publicKey, { 
            issuer: env.AUTH_ISSUER,
            audience: env.AUTH_AUDIENCE,
            algorithms: ['ES256'],
         });
         return { authId: payload.sub };
      } catch (error) {
         return { authId: undefined }
      }
   }
)

export const authorizeMiddleware = new Elysia({ name: 'authorize' })
.use(authenticateMiddleware) //? does this mean authenticateMiddleware is running twice if its used earlier or the same instance is being used again?
.derive(
   { as: 'scoped' },
   ({ authId }): { authId: string } => {
      if (!authId) { throw new UnauthorizedError('Invalid or expired token'); }
      return { authId }
   },
);