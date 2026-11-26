import type { Types } from "mongoose";
import { FriendRequestModel, type FriendRequestRecord } from "../../../externalResources/database/mongoose/schemas/friendRequest.schema";
import { AccessControlled } from "../../authorization/decorators/AccessControlled.function";
import { Protected } from "../../authorization/decorators/Protected";
import { FriendshipModel, type FriendshipRecord } from "../../../externalResources/database/mongoose/schemas/friendship.schema";
import type { TypeRelationship } from "../domain/relationships.types";
import { AppErrorNotFound } from "../../../global/departingData/errorClasses";


export class RelationshipsRepository extends AccessControlled {



   @Protected
   async createFriendRequest(targetId: Types.ObjectId): Promise<FriendRequestRecord> {
      const friendRequest = await FriendRequestModel.create({ senderId: this.authorization.requireClientId(), receiverId: targetId });
      return friendRequest.toObject();
   }



   @Protected
   async createFriendship(targetId: Types.ObjectId): Promise<FriendshipRecord> {
      const pendingFriendRequestRecord = FriendRequestModel.findOneAndDelete({ receiverId: this.authorization.requireClientId(), senderId: targetId });
      if (!pendingFriendRequestRecord) { throw new AppErrorNotFound(); }
      const friendship = await FriendshipModel.create({ friendIds: [this.authorization.requireClientId(), targetId] });
      return friendship;
   }



   @Protected
   async deleteFriendRequest(_id: Types.ObjectId) {
      const deleteResponse = await FriendRequestModel.deleteOne({ _id, $or: [{ senderId: this.authorization.requireClientId() }, { receiverId: this.authorization.requireClientId() }] });
      if (deleteResponse.deletedCount === 0) { throw new AppErrorNotFound(); }
   }



   @Protected
   async deleteFriendship(_id: Types.ObjectId) {
      const deleteResponse = await FriendshipModel.deleteOne({ _id, friendIds: this.authorization.requireClientId() });
      if (deleteResponse.deletedCount === 0) { throw new AppErrorNotFound(); }
   }



   async findRelationship(params: { ownerId: Types.ObjectId, targetId: Types.ObjectId, skipRequests?: boolean, skipFriendships?: boolean }): Promise<TypeRelationship | null> {
      const { ownerId, targetId, skipRequests = false, skipFriendships = false } = params;

      if (!skipRequests && (ownerId.equals(this.authorization.clientId) || targetId.equals(this.authorization.clientId))) {
         const friendRequestRecord = await FriendRequestModel.findOne({
            $or: [
               { senderId: ownerId, receiverId: targetId },
               { senderId: targetId, receiverId: ownerId },
            ],
         }).lean();

         if (friendRequestRecord !== null) {
            if (this.authorization.requireClientId().equals(friendRequestRecord.senderId)) { return { _id: friendRequestRecord._id, ownerId: this.authorization.requireClientId(), targetId, type: "requestReceived" } }
            else { return { _id: friendRequestRecord._id, ownerId: this.authorization.requireClientId(), targetId, type: "requestSent" } } 
         }
      }

      if (!skipFriendships) {
         const friendship = await FriendshipModel.findOne({ friendIds: { $all: [this.authorization.requireClientId(), targetId] } }).lean();
         if (friendship != null) { return { _id: friendship._id, targetId, ownerId: this.authorization.requireClientId(), type: 'friend' } }
      }

      return null;
   }



   @Protected
   async getFriendRequest(_id: Types.ObjectId): Promise<FriendRequestRecord> {
      const friendRequestRecord = await FriendRequestModel.findOne({ _id }).lean();
      if (!friendRequestRecord) { throw new AppErrorNotFound(); }
      else { return friendRequestRecord; }
   }



   async getFriendship(_id: Types.ObjectId): Promise<FriendshipRecord> {
      const friendshipRecord = await FriendshipModel.findOne({ _id }).lean();
      if (!friendshipRecord) { throw new AppErrorNotFound(`friendship`) }
      else { return friendshipRecord; }
   }



   async searchFriendship(userId: Types.ObjectId): Promise<FriendshipRecord[]> {
      return FriendshipModel.find({ 
         friendIds: { $in: [ userId ]}, 
      }).lean<FriendshipRecord[]>();
   }
}