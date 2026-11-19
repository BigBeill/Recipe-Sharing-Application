import { Elysia, status, t } from 'elysia';
import { authenticateMiddleware } from '../authentication.middleware';
import { NotFoundError } from '../../../global/departingData/errorClasses';
import { ValidatorCommonMongooseId } from '../../../common/domain/validators/mongooseId.validator';
import { ValidatorIncomingAuthLoginBody } from './validators/login.validator';
import { ValidatorIncomingAuthRequestPasswordResetBody } from './validators/requestPasswordReset.validator';
import type { AuthenticationService } from '../application/authentication.service';
import { authorizeMiddleware } from '../../authorization/authorization.middleware';

export const authenticationController = new Elysia({ prefix: '/auth' })
   .use(authenticateMiddleware)
   .derive(({ scope }) => ({
      service: scope.resolve<AuthenticationService>('authenticationService'),
   }))
   .post( '/login', 
      async ({ body, cookie: { accessToken, refreshToken }, service }) => {
         const { name, password, rememberMe } = body;

         const authResult = await service.login({ name, password, rememberMe });

         // * set cookies for the client
         accessToken.set({
            value: authResult.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: authResult.tokens.refreshToken,
            ...(rememberMe && { maxAge: 60 * 60 * 24 * 30 }) // 30 days in seconds if rememberMe is true
         });

         return status(200, authResult.userId);
      },
      {
         body: ValidatorIncomingAuthLoginBody,
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.Optional(t.String()),
         }),
         response: { 200: ValidatorCommonMongooseId },
      }
   )



   .post( '/refresh',
      async ({ cookie: { accessToken, refreshToken }, service }) => {

         const authResult = await service.refresh(refreshToken.value);

         // * set cookies
         accessToken.set({
            value: authResult.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: authResult.tokens.refreshToken,
            maxAge: 60 * 60 * 24 * 30 // 30 days in seconds
         });

         return status(200, authResult.tokens.accessToken);
      },
      {
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.String(),
         }),
         response: { 200: t.String() }
      }
   )



   .post('/requestPasswordReset',
      async ({ body, service }) => {
         const { email } = body;

         // ? catch any not found errors and return as if the request was a success (prevents an enumeration attack)
         try { await service.requestPasswordReset(email); }
         catch (error) { if (!(error instanceof NotFoundError)) { throw error; } }

         return status(204);
      },
      {
         body: ValidatorIncomingAuthRequestPasswordResetBody,
      }
   )



   .use(authorizeMiddleware)



   .get( '/status', 
      ({ authorization }) => {
         return status(200, authorization.clientId);
      },
      {
         response: { 200: ValidatorCommonMongooseId }
      }
   )



   .post( '/logout',
      async ({ cookie: { accessToken, refreshToken }, service }) => {
         await service.deleteRefreshToken(refreshToken.value);

         // * set cookies
         accessToken.remove();
         refreshToken.remove();

         return status(204);
      },
      {
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.String(),
         })
      }
   )