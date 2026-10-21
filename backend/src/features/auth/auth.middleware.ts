// src/modules/auth/auth.middleware.ts
import { Elysia } from 'elysia';
import { jwtVerify } from 'jose';
import { publicKey } from './keys';
import { UnauthorizedError } from '../../global/departingData/error.types';
import { env } from '../../global/config/env.config';
import { Types } from 'mongoose';



const OBJECT_ID_HEX = /^[0-9a-fA-F]{24}$/;



export const authenticateMiddleware = new Elysia({ name: 'authenticate' }).derive(
   { as: 'scoped' },
   async ({ cookie: { accessToken } }): Promise<{ authId?: Types.ObjectId }> => {
      const token = accessToken?.value as string;
      if (!token) { return { authId: undefined } }
      
      try {
         const { payload } = await jwtVerify(token, publicKey, { 
            issuer: env.AUTH_ISSUER,
            audience: env.AUTH_AUDIENCE,
            algorithms: ['ES256'],
         });

         if (!payload.sub || !OBJECT_ID_HEX.test(payload.sub)) { return { authId: undefined } }
         return { authId: new Types.ObjectId(payload.sub) };
      } catch (error) {
         return { authId: undefined }
      }
   }
)

export const authorizeMiddleware = new Elysia({ name: 'authorize' })
.use(authenticateMiddleware)
.derive(
   { as: 'scoped' },
   ({ authId }): { authId: Types.ObjectId } => {
      if (!authId) { throw new UnauthorizedError('Invalid or expired token'); }
      return { authId }
   },
);