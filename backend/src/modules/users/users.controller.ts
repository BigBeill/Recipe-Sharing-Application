import Elysia from "elysia";
import { authenticateMiddleware, authorizeMiddleware } from "../auth/auth.middleware";
import { GetValidator } from "./validators/get.validator";
import { SearchValidator } from "./validators/search.validator";
import { usersService } from "../../container";
import { UpdateValidator } from "./validators/update.validator";
import { ProcessFriendRequestValidator } from "./validators/processFriendRequest.validator";
import { IdValidator } from "../../common/validators/id.validator";

const service = usersService

export const usersController = new Elysia({ prefix: '/users' })



   //* Routes past this point use but do not require an accessToken
   .use(authenticateMiddleware)



   .get( '/get/:_id',
      async ({ params, query, authId }) => {
         const { _id } = params;
         const { includeRelationship = false } = query;
         const user = await service.getUser(_id, { authId, includeRelationship });
         return { data: user }
      },
      {
         params: IdValidator,
         query: GetValidator
      }
   )



   .get( '/search',
      async ({ authId, query }) => {
         const { _id, name, skip = 0, limit = 32, includeRelationship } = query;
         const users = await service.searchUsers({ authId, _id, name, skip, limit, includeRelationship });
         return { data: users }
      },
      {
         query: SearchValidator
      }

   )



   //* Routes past this point require a valid accessToken to use
   .use(authorizeMiddleware)



   .get( '/defineRelationship/:_id',
      async ({ params, authId }) => {
         const { _id } = params
         const definedRelationship = await service.defineRelationship({ authId, userId: _id });
         return { data: definedRelationship };
      },
      {
         params: IdValidator
      }
   )



   .post( '/deleteFriendship/:_id',
      async ({ set, authId, params }) => {
         const { _id } = params;
         await service.deleteFriendship(_id, { authId });
         set.status = 201;
         return;
      },
      {
         params: IdValidator
      }
   )



   .post( '/processFriendRequest/:_id/:response',
      async ({ set, authId, params }) => {
         const{ _id, response } = params;
         await service.processFriendRequest(_id, response, { authId });
         set.status = 201;
         return;
      },
      {
         params: ProcessFriendRequestValidator
      }
   )



   .post( '/sendFriendRequest/:_id',
      async ({ authId, params }) => {
         const { _id } = params;
         const friendRequest = await service.sendFriendRequest(_id, { authId });
         return { data: friendRequest }
      },
      {
         params: IdValidator
      }
   )



   .put( '/update',
      async ({ authId, body }) => {
         const { name, email, bio, image } = body;
         const updatedUser = await service.updateAccount({ authId, name, email, bio, image});
         return { data: updatedUser }
      },
      {
         body: UpdateValidator,
      }
   )