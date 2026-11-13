import { Elysia } from 'elysia';
import { jwtVerify } from 'jose';
import { publicKey } from './keys';
import { env } from '../../global/config/env.config';
import { Types } from 'mongoose';
import { asValue } from 'awilix';
import { container } from '../../container'; // adjust path
import type { AuthorizationService } from '../authorization/authorization.service';



const OBJECT_ID_HEX = /^[0-9a-fA-F]{24}$/;



async function readAuthId(token: string | undefined): Promise<Types.ObjectId | undefined> {
   if (!token) { return undefined }

   try {
      const { payload } = await jwtVerify(token, publicKey, {
         issuer: env.AUTH_ISSUER,
         audience: env.AUTH_AUDIENCE,
         algorithms: ['ES256'],
      });

      if (!payload.sub || !OBJECT_ID_HEX.test(payload.sub)) { return undefined }
      return new Types.ObjectId(payload.sub);
   } catch (error) {
      return undefined;
   }
}

export const authenticateMiddleware = new Elysia({ name: 'authenticate' })
.derive({ as: 'scoped' }, async ({ cookie: { accessToken } }) => {
      const authId = await readAuthId(accessToken?.value as string | undefined);

      const scope = container.createScope();
      scope.register({ authId: asValue(authId ?? null) });
      const authorization = scope.resolve<AuthorizationService>('authorizationService');

      return { scope, authorization };
   }
)