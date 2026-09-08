import type { FriendRequestRecord } from "../../common/mongo-db/schemas/friendRequest.schema";
import type { FriendshipRecord } from "../../common/mongo-db/schemas/friendship.schema";
import type { UsersRepository } from "../users/users.repository";
import type { RelationshipType } from "../users/users.types";

export class PermissionsService {
   private readonly repository: UsersRepository;

   constructor(usersRepository: UsersRepository) {
      this.repository = usersRepository;
   }

   async defineRelationship({ authId, userId }: { authId: string, userId: string }): Promise<RelationshipType> {
      const definingRelationship = { ownerId: userId, targetId: authId }

      if (definingRelationship.ownerId = definingRelationship.targetId) { 
         return { _id: "0", type: "self", ...definingRelationship }
      }

      let relationship: FriendshipRecord | FriendRequestRecord | null;
      relationship = await this.repository.getFriendship({ firstUserId: definingRelationship.ownerId, secondUserId: definingRelationship.targetId });
      if (relationship) {
         return { _id: relationship._id.toString(), type: "friend", ...definingRelationship };
      }
      relationship = await this.repository.getFriendRequest({ senderId: definingRelationship.ownerId, receiverId: definingRelationship.targetId });
      if (relationship) {
         return { _id: relationship._id.toString(), type: "requestSent", ...definingRelationship };
      }
      relationship = await this.repository.getFriendRequest({ senderId: definingRelationship.targetId, receiverId: definingRelationship.ownerId });
      if (relationship) {
         return { _id: relationship._id.toString(), type: "requestReceived", ...definingRelationship }
      }

      //? relationship must not exist if nothing has been returned
      return { _id: "0", type: "none", ...definingRelationship };
   }

   async getFriendIdList(userId: string) {
      const friendshipList = await this.repository.getFriendshipList(userId);
      
      // filter out the userId from each friendship and return an array of Ids
      return friendshipList.map((friendship) => {
         const firstFriendId = friendship.friendIds[0]!.toString();
         if (firstFriendId !== userId) { return firstFriendId; }
         else { return friendship.friendIds[1]!.toString(); }
      });
   }
}