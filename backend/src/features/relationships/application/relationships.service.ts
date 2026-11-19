import type { Types } from "mongoose";
import type { RelationshipsRepository } from "../infrastructure/relationships.repository";
import type { TypeRelationship } from "../domain/relationships.types";
import { AccessControlled } from "../../authorization/decorators/AccessControlled.function";
import type { AuthorizationService } from "../../authorization/authorization.service";
import { UnauthorizedError } from "../../../global/departingData/errorClasses";



interface DefinedRelationshipParams {
   ownerId: Types.ObjectId;
   targetId: Types.ObjectId;
}



export class RelationshipsService extends AccessControlled {
   private readonly repository;

   constructor ({ authorizationService, relationshipsRepository } : {
      authorizationService: AuthorizationService,
      relationshipsRepository: RelationshipsRepository,
   }) {
      super({ authorizationService });
      this.repository = relationshipsRepository;
   }


   async deleteFriendship(_id: Types.ObjectId): Promise<void> {
      await this.repository.deleteFriendship(_id);
   }



   async findRelationship(params: DefinedRelationshipParams): Promise<TypeRelationship | null> {
      const { ownerId, targetId } = params;
      return await this.repository.findRelationship({ targetId, ownerId });
   }



   async getFriendIdList(userId: Types.ObjectId) {
      const friendshipList = await this.repository.searchFriendship(userId);
      
      // filter out the userId from each friendship and return an array of Ids
      return friendshipList.flatMap((friendship) => { return friendship.friendIds.filter((id) => !id.equals(userId)) });
   }



   async sendFriendRequest(targetId: Types.ObjectId): Promise<TypeRelationship> {
      const friendRequest = await this.repository.createFriendRequest(targetId);
      return {
         _id: friendRequest._id,
         ownerId: targetId,
         targetId: this.authorization.requireClientId(),
         type: 'requestReceived',
      }
   }



   async processFriendRequest(_id: Types.ObjectId, approve: boolean): Promise<TypeRelationship | null> {
      // get friendship from the database
      const friendRequest = await this.repository.getFriendRequest(_id);

      // check if friendship can be approved
      if (approve && friendRequest.receiverId.equals(this.authorization.clientId)) {
         const friendship = await this.repository.createFriendship(friendRequest.senderId);
         return {
            _id: friendship._id,
            ownerId: friendRequest.senderId,
            targetId: this.authorization.requireClientId(),
            type: "friend",
         }
      }

      // check if friendship can be declined
      else if (!approve && (friendRequest.receiverId.equals(this.authorization.clientId) || friendRequest.senderId.equals(this.authorization.clientId))) {
         await this.repository.deleteFriendRequest(_id);
         return null;
      }

      // whatever the client is attempting to do was not executable
      else { throw new UnauthorizedError('Invalid credentials'); }
   }
}