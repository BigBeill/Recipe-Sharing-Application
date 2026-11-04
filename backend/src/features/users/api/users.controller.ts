import Elysia, { status, t } from "elysia";
import { authenticateMiddleware, authorizeMiddleware } from "../../auth/auth.middleware";
import { usersService } from "../../../container";
import { ValidatorIncomingUsersGetBody } from "./validators/get.validator";
import { ValidatorCommonMongooseId } from "../../../common/domain/validators/mongooseId.validator";
import { ValidatorCommonUser, ValidatorCommonUserDraft } from "../domain/validators/user.validator";
import { ValidatorIncomingUsersSearchBody } from "./validators/search.validator";
import { ValidatorCommonPaginatedList } from "../../../common/domain/validators/pagination.validator";
import { ValidatorCommonRelationship } from "../domain/validators/relationship.validator";
import { ValidatorIncomingUsersProcessFriendRequestBody } from "./validators/processFriendRequest.validator";

const service = usersService

export const usersController = new Elysia({ prefix: '/users' })



   //* Routes past this point use but do not require an accessToken
   .use(authenticateMiddleware)



   .get( '/get/:_id',
      async ({ params, query, authId }) => {
         const { _id } = params;
         const { includeRelationship = false } = query;
         const user = await service.get(_id, { authId, includeRelationship });
         return status(200, user);
      },
      {
         params: t.Object(ValidatorCommonMongooseId),
         query: ValidatorIncomingUsersGetBody,
         response: { 200: ValidatorCommonUser },
      }
   )



   .get( '/search',
      async ({ authId, query }) => {
         const { _id, name, skip = 0, limit = 32, includeRelationship } = query;
         const users = await service.searchUsers({ authId, _id, name, skip, limit, includeRelationship });
         return status(200, users);
      },
      {
         query: ValidatorIncomingUsersSearchBody,
         response: ValidatorCommonPaginatedList(ValidatorCommonUser),
      }

   )



   //* Routes past this point require a valid accessToken to use
   .use(authorizeMiddleware)



   .get( '/defineRelationship/:_id',
      async ({ params, authId }) => {
         const { _id } = params
         const definedRelationship = await service.findRelationship({ ownerId: authId, targetId: _id });
         if (definedRelationship) { return status(200, definedRelationship); }
         else { return status(204, undefined); }
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         response: { 
            200: ValidatorCommonRelationship,
            204: t.Void()
         }
      }
   )



   .post( '/deleteFriendship/:_id',
      async ({ authId, params }) => {
         const { _id } = params;
         await service.deleteFriendship(_id, { authId });
         return status(201);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
      }
   )



   .post( '/processFriendRequest/:_id/:response',
      async ({ authId, params }) => {
         const{ _id, response } = params;
         const relationship = await service.processFriendRequest(_id, response, { authId });
         return status(201, relationship);
      },
      {
         params: ValidatorIncomingUsersProcessFriendRequestBody,
         response: { 201: t.Union([ValidatorCommonRelationship, t.Void()]) }
      }
   )



   .post( '/sendFriendRequest/:_id',
      async ({ authId, params }) => {
         const { _id } = params;
         const friendRequest = await service.sendFriendRequest(_id, { authId });
         return status(200, friendRequest);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         response: ValidatorCommonRelationship,
      }
   )



   .put( '/update/:_id',
      async ({ authId, body, params }) => {
         const { _id } = params;
         const { name, bio, imageReference } = body;
         const response = await service.update({ _id, name, bio, imageReference, authId });
         return status(201, response);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         body: t.Partial(ValidatorCommonUserDraft),
         response: { 201: ValidatorCommonUser }
      }
   )