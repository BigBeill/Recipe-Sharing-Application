import Elysia, { status, t } from "elysia";
import { authenticateMiddleware } from "../../authentication/authentication.middleware";
import { ValidatorIncomingUsersGetBody } from "./validators/get.validator";
import { ValidatorCommonMongooseId } from "../../../common/domain/validators/mongooseId.validator";
import { ValidatorCommonUser, ValidatorCommonUserDraft } from "../domain/validators/user.validator";
import { ValidatorIncomingUsersSearchBody } from "./validators/search.validator";
import { ValidatorCommonPaginatedList } from "../../../common/domain/validators/pagination.validator";
import type { UsersService } from "../application/users.service";
import { authorizeMiddleware } from "../../authorization/authorization.middleware";
import { ValidatorIncomingAuthRegisterBody } from "./validators/register.validator";
import { ValidatorIncomingAuthChangePasswordBody } from "./validators/changePassword.validator";

export const usersController = new Elysia({ prefix: '/users' })
   .use(authenticateMiddleware)
   .derive(({ scope }) => ({
      service: scope.resolve<UsersService>("usersService")
   }))



   .get( '/get/:_id',
      async ({ params, query, service }) => {
         const { _id } = params;
         const { includeRelationship = false } = query;
         const user = await service.get(_id, { includeRelationship });
         return status(200, user);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         query: ValidatorIncomingUsersGetBody,
         response: { 200: ValidatorCommonUser },
      }
   )



   .post( '/register',
      async ({ body, cookie: { accessToken, refreshToken }, service }) => {
         const { name, email, password } = body;

         const authResult = await service.create({ name, email, password });

         // * set cookies
         accessToken.set({
            value: authResult.tokens.accessToken,
            maxAge: 60 * 15 // 15 minutes in seconds
         });
         refreshToken.set({
            value: authResult.tokens.refreshToken,
         });

         return status(200, authResult.userId);
      },
      {
         body: ValidatorIncomingAuthRegisterBody,
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.Optional(t.String()),
         }),
         response: ValidatorCommonMongooseId,
      }
   )



   .get( '/search',
      async ({ service, query }) => {
         const { _id, name, skip = 0, limit = 32, includeRelationship } = query;
         const users = await service.searchUsers({ _id, name, skip, limit, includeRelationship });
         return status(200, users);
      },
      {
         query: ValidatorIncomingUsersSearchBody,
         response: ValidatorCommonPaginatedList(ValidatorCommonUser),
      }

   )



   //* Routes past this point require a valid accessToken to use
   .use(authorizeMiddleware)



   .post( '/changePassword',
      async ({ body, service, authorization }) => {
         const { oldPassword, newPassword } = body;
         const reauthenticationProof = await authorization.reauthenticate(oldPassword);
         await service.changePassword(reauthenticationProof, newPassword);
         return status(201);
      },
      {
         body: ValidatorIncomingAuthChangePasswordBody,
      }
   )



   .post('/delete',
      async ({ service, body, authorization, cookie: { accessToken, refreshToken } }) => {
         const { password } = body;
         const reauthenticationProof = await authorization.reauthenticate(password);
         service.delete(reauthenticationProof);

         accessToken.remove();
         refreshToken.remove();

         return status(204);
      },
      {
         body: t.Object({ password: t.String() }),
         cookie: t.Object({
            accessToken: t.Optional(t.String()),
            refreshToken: t.String(),
         })
      }
   )



   .put( '/update',
      async ({ service, body }) => {
         const { name, bio, imageReference } = body;
         const response = await service.update({ name, bio, imageReference });
         return status(201, response);
      },
      {
         body: t.Partial(ValidatorCommonUserDraft),
         response: { 201: ValidatorCommonUser }
      }
   )