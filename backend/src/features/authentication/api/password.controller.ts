import Elysia, { status } from "elysia";
import { ValidatorIncomingAuthRequestPasswordResetBody } from "./validators/requestPasswordReset.validator";
import { ValidatorIncomingAuthResetPasswordBody } from "./validators/resetPassword.validator";
import type { AuthenticationService } from "../application/authentication.service";
import { container } from "../../../container";
import { asValue } from "awilix";
import type { UsersService } from "../../users/application/users.service";

export const passwordController = new Elysia({ prefix: '/password' })
   .derive({ as: 'scoped' }, async () => {
      // ! Scope is defined here but only authenticateService is resolved
      // ! DO NOT RESOLVE ANY OTHER SERVICES UNTIL { clientId } HAS BEEN REGISTERED WITH THE SCOPE
      const scope = container.createScope();
      const authenticationService = scope.resolve<AuthenticationService>('authenticationService');
      return { scope, authenticationService };
   })

   .post('/reset/request',
      async ({ body, authenticationService }) => {
         authenticationService.requestPasswordReset(body.email); // ? fire and forget so timing attacks don't work (attacker should not be able to figure out if an email is registered with our application or not)
         return status(201);
      },
      {
         body: ValidatorIncomingAuthRequestPasswordResetBody,
      }
   )

   .post('/reset/confirm',
      async ({ body, authenticationService, scope }) => {
         const clientId = await authenticationService.consumePasswordResetToken(body.token);
         const userService = scope.register({ clientId: asValue(clientId) }).resolve<UsersService>('usersService');
         await userService.resetPassword(body.password);
         return status(201);
      },
      {
         body: ValidatorIncomingAuthResetPasswordBody,
      }
   );