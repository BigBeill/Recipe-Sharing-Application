import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export type Session = { userId: string; roles: string[] };

const JWKS = createRemoteJWKSet(new URL(`${process.env.ELYSIA_URL}/.well-known/jwks.json`));

export const verifySession = cache(async (): Promise<Session | null> => {

   const token = (await cookies()).get('accessToken')?.value;
   if (!token) { return null; }

   try {
      const { payload } = await jwtVerify(token, JWKS, {
         issuer: process.env.AUTH_ISSUER,
         audience: process.env.AUTH_AUDIENCE,
         algorithms: ['ES256'],
      });
      return { userId: payload.sub as string, roles: (payload.roles as string[]) ?? [] };
   } catch (error) {
      console.log('token failed:', error)
      return null;
   }
});