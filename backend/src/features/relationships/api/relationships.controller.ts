import Elysia, { status, t } from "elysia";
import { authenticateMiddleware } from "../../authentication/authentication.middleware";
import type { RelationshipsService } from "../application/relationships.service";
import { authorizeMiddleware } from "../../authorization/authorization.middleware";
import { ValidatorCommonMongooseId } from "../../../common/domain/validators/mongooseId.validator";
import { ValidatorCommonRelationship } from "../domain/validators/relationship.validator";
import { ValidatorIncomingUsersProcessFriendRequestBody } from "./validators/processFriendRequest.validator";

export const relationshipsController = new Elysia({ prefix: '/relationships' })
   .use(authenticateMiddleware)
   .derive(({ scope }) => ({
      service: scope.resolve<RelationshipsService>("relationshipsService")
   }))



   .use(authorizeMiddleware)



   .get( '/defineRelationship/:_id',
      async ({ params, service, clientId }) => {
         const { _id } = params
         const definedRelationship = await service.findRelationship({ ownerId: clientId, targetId: _id });
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
      async ({ service, params }) => {
         const { _id } = params;
         await service.deleteFriendship(_id);
         return status(201);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
      }
   )



   .post( '/processFriendRequest/:_id',
      async ({ service, params, body, set }) => {
         const{ _id } = params;
         const { approve } = body;
         const relationship = await service.processFriendRequest(_id, approve);
         set.status = 201;
         return relationship;
      },
      {
         body: t.Object({ approve: t.Boolean() }),
         params: ValidatorIncomingUsersProcessFriendRequestBody,
         response: { 201: t.Union([ValidatorCommonRelationship, t.Null()]) }
      }
   )



   .post( '/sendFriendRequest/:_id',
      async ({ service, params }) => {
         const { _id } = params;
         const friendRequest = await service.sendFriendRequest(_id);
         return status(200, friendRequest);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         response: ValidatorCommonRelationship,
      }
   )