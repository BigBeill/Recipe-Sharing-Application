import { Elysia, status, t } from 'elysia';
import { RegisterValidator } from './validators/register.validator';
import { LoginValidator } from './validators/login.validator';
import { authenticateMiddleware, authorizeMiddleware } from '../auth.middleware';
import { requestPasswordResetValidator } from './validators/requestPasswordReset.validator';
import { resetPasswordValidator } from './validators/resetPassword.validator';
import { changePasswordValidator } from './validators/changePassword.validator';
import { authService } from '../../../container';
import { NotFoundError } from '../../../global/departingData/errorClasses';
import { DepartingIdValidator } from '../../../global/departingData/validators/departingId.validator';
import { DepartingStringValidator } from '../../../global/departingData/validators/primitives/departingString.validator';

const service = authService;

export const authController = new Elysia({ prefix: '/auth' })



   .post( '/login',
      async ({ body, cookie: { accessToken, refreshToken } }) => {
         const { name, password, rememberMe } = body;

         const result = await service.login({ name, password });

         // * set cookies for the client
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: result.tokens.refreshToken,
            ...(rememberMe && { maxAge: 60 * 60 * 24 * 30 }) // 30 days in seconds if rememberMe is true
         });

         return status(200, result.userId);
      },
      {
         body: LoginValidator,
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.Optional(t.String()),
         }),
         response: DepartingIdValidator,
      }
   )



   .post( '/refresh',
      async ({ cookie: { accessToken, refreshToken } }) => {

         const result = await service.refresh(refreshToken.value);

         // * set cookies
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: result.tokens.refreshToken,
            maxAge: 60 * 60 * 24 * 30 // 30 days in seconds
         });

         return status(200, result.tokens.accessToken);
      },
      {
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.String(),
         }),
         response: DepartingStringValidator
      }
   )



   .post( '/register',
      async ({ body, cookie: { accessToken, refreshToken } }) => {
         const { name, email, password } = body;

         const result = await service.register({ name, email, password });

         // * set cookies
         accessToken.set({
            value: result.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: result.tokens.refreshToken,
         });

         return status(200, result.userId);
      },
      {
         body: RegisterValidator,
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.Optional(t.String()),
         }),
         response: DepartingIdValidator,
      }
   )



   .post('/requestPasswordReset',
      async ({ body }) => {
         const { email } = body;

         // ? catch any not found errors and return as if the request was a success (prevents an enumeration attack)
         try { await service.requestPasswordReset(email); }
         catch (error) { if (!(error instanceof NotFoundError)) { throw error; } }

         return status(204);
      },
      {
         body: requestPasswordResetValidator,
      }
   )



   .post('/resetPassword',
      async ({ body }) => {
         const { password, token } = body;
         await service.resetPassword(password, token);
         return status(204);
      },
      {
         body: resetPasswordValidator,
      }
   )



   .use(authenticateMiddleware)
   .use(authorizeMiddleware) // * Routes past this point require a valid accessToken to use



   .post( '/changePassword',
      async ({ body, authId }) => {
         const { oldPassword, newPassword } = body;
         await service.changePassword(oldPassword, newPassword, { authId });
         return status(201);
      },
      {
         body: changePasswordValidator,
      }
   )



   .get( '/status', 
      ({ authId }) => {
         return status(200, authId)
      },
      {
         response: DepartingIdValidator
      }
   )



   .post( '/logout',
      async ({ cookie: { accessToken, refreshToken } }) => {
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