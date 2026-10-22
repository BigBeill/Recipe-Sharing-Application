import Elysia, { status, t } from "elysia";
import { authenticateMiddleware, authorizeMiddleware } from "../../auth/auth.middleware";
import { GetValidator } from "./validators/get.validator";
import { SearchValidator } from "./validators/search.validator";
import { usersService } from "../../../container";
import { UpdateValidator } from "./validators/update.validator";
import { ProcessFriendRequestValidator } from "./validators/processFriendRequest.validator";
import { IdParamsValidator } from "../../../common/api/validators/id.validator";
import { DepartingUserValidator } from "../../../global/departingData/validators/departingUserValidator";
import { DepartingPaginatedList } from "../../../global/departingData/validators/departingPaginatedList";
import { DepartingRelationshipValidator } from "../../../global/departingData/validators/departingRelationshipValidator";

const service = usersService

export const usersController = new Elysia({ prefix: '/users' })



   //* Routes past this point use but do not require an accessToken
   .use(authenticateMiddleware)



   .get( '/get/:_id',
      async ({ params, query, authId }) => {
         const { _id } = params;
         const { includeRelationship = false } = query;
         const user = await service.getUser(_id, { authId, includeRelationship });
         return status(200, user);
      },
      {
         params: IdParamsValidator,
         query: GetValidator,
         response: DepartingUserValidator,
      }
   )



   .get( '/search',
      async ({ authId, query }) => {
         const { _id, name, skip = 0, limit = 32, includeRelationship } = query;
         const users = await service.searchUsers({ authId, _id, name, skip, limit, includeRelationship });
         return status(200, users);
      },
      {
         query: SearchValidator,
         response: DepartingPaginatedList(DepartingUserValidator)
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
         params: IdParamsValidator,
         response: { 
            200: DepartingRelationshipValidator,
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
         params: IdParamsValidator,
      }
   )



   .post( '/processFriendRequest/:_id/:response',
      async ({ authId, params }) => {
         const{ _id, response } = params;
         const relationship = await service.processFriendRequest(_id, response, { authId });
         return status(201, relationship);
      },
      {
         params: ProcessFriendRequestValidator,
         response: { 201: t.Union([DepartingRelationshipValidator, t.Void()]) }
      }
   )



   .post( '/sendFriendRequest/:_id',
      async ({ authId, params }) => {
         const { _id } = params;
         const friendRequest = await service.sendFriendRequest(_id, { authId });
         return status(200, friendRequest);
      },
      {
         params: IdParamsValidator,
         response: DepartingRelationshipValidator,
      }
   )



   .put( '/update',
      async ({ authId, body }) => {
         const { name, email, bio, imageReference } = body;
         const updatedUser = await service.updateAccount({ authId, name, email, bio, imageReference });
         return { data: updatedUser }
      },
      {
         body: UpdateValidator,
      }
   )