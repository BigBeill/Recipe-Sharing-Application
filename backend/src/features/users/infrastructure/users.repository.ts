import type { Types } from "mongoose";
import { escapeRegex } from "../../../common/utils/filter";
import { FriendRequestModel, type FriendRequestRecord } from "../../../externalResources/database/mongoose/schemas/friendRequest.schema";
import { FriendshipModel, type FriendshipRecord } from "../../../externalResources/database/mongoose/schemas/friendship.schema";
import { UserModel, type UserRecord } from "../../../externalResources/database/mongoose/schemas/user.schema";
import type { TypeRelationship } from "../domain/users.types";
import type { TypePaginatedList } from "../../../common/domain/types.common";
import { NotFoundError, UnauthorizedError } from "../../../global/departingData/errorClasses";
import { Protected, ProtectedRepository } from "../../authorization/decorators/ProtectedRepository";

interface SearchUserParams {
   _id?: Types.ObjectId,
   name?: string,
   email?: string
   skip?: number,
   limit?: number,
   searchExact?: boolean,
}

interface UpdateUserParams {
   name?: string,
   email?: string,
   bio?: string,
   imageReferenceId?: Types.ObjectId,
}

export class UsersRepository extends ProtectedRepository{
   readonly resourceName = "users";



   @Protected
   async createFriendRequest(targetId: Types.ObjectId): Promise<FriendRequestRecord> {
      const friendRequest = await FriendRequestModel.create({ senderId: this.clientId, receiverId: targetId });
      return friendRequest.toObject();
   }



   @Protected
   async createFriendship(targetId: Types.ObjectId): Promise<FriendshipRecord> {
      const pendingFriendRequestRecord = FriendRequestModel.findOneAndDelete({ receiverId: this.authorization.id, senderId: targetId });
      if (!pendingFriendRequestRecord) { throw new NotFoundError(); }
      const friendship = await FriendshipModel.create({ friendIds: [this.clientId, targetId] });
      return friendship;
   }



   @Protected
   async deleteFriendRequest(_id: Types.ObjectId) {
      const deleteResponse = await FriendRequestModel.deleteOne({ $match: { _id, $or: [{ senderId: this.clientId }, { receiverId: this.clientId }] } });
      if (deleteResponse.deletedCount === 0) { throw new NotFoundError(); }
   }



   @Protected
   async deleteFriendship(_id: Types.ObjectId) {
      const deleteResponse = await FriendshipModel.deleteOne({ _id, friendIds: this.authorization.id });
      if (deleteResponse.deletedCount === 0) { throw new NotFoundError(); }
   }



   @Protected
   async deleteUser(_id: Types.ObjectId): Promise<void> {
      const deleteResponse = await UserModel.deleteOne({ _id });
      if (deleteResponse.deletedCount === 0) { throw new NotFoundError(); }
   }



   @Protected
   async findRelationship(params: { targetId: Types.ObjectId, skipRequests?: boolean, skipFriendships?: boolean }): Promise<TypeRelationship | null> {
      const { targetId, skipRequests = false, skipFriendships = false } = params;

      if (!skipRequests) {
         const friendRequestRecord = await FriendRequestModel.findOne({
            $or: [
               { senderId: this.authorization.id, receiverId: targetId },
               { senderId: targetId, receiverId: this.authorization.id },
            ],
         }).lean();

         if (friendRequestRecord !== null) {
            if (this.clientId.equals(friendRequestRecord.senderId)) { return { _id: friendRequestRecord._id, ownerId: this.clientId, targetId, type: "requestSent" } }
            else { return { _id: friendRequestRecord._id, ownerId: this.clientId, targetId, type: "requestReceived" } } 
         }
      }

      if (!skipFriendships) {
         const friendship = await FriendshipModel.findOne({ friendIds: { $all: [this.authorization.id, targetId] } }).lean();
         if (friendship != null) { return { _id: friendship._id, targetId, ownerId: this.clientId, type: 'friend' } }
      }

      return null;
   }



   @Protected
   async getFriendRequest(_id: Types.ObjectId): Promise<FriendRequestRecord> {
      const friendRequestRecord = await FriendRequestModel.findOne({ _id }).lean();
      if (!friendRequestRecord) { throw new NotFoundError(); }
      else { return friendRequestRecord; }
   }



   async getFriendship(_id: Types.ObjectId): Promise<FriendshipRecord> {
      const friendshipRecord = await FriendshipModel.findOne({ _id }).lean();
      if (!friendshipRecord) { throw new NotFoundError(`friendship`) }
      else { return friendshipRecord; }
   }



   async getUser(_id: Types.ObjectId): Promise<UserRecord> {
      const user = await UserModel.findOne({_id }).lean<UserRecord>();
      if (!user) { throw new NotFoundError(`friendship`); }
      else { return user; }
   }



   async searchFriendship(userId: Types.ObjectId): Promise<FriendshipRecord[]> {
      return FriendshipModel.find({ 
         friendIds: { $in: [ userId ]}, 
      }).lean<FriendshipRecord[]>();
   }



   async searchUser({ _id, name, email, skip, limit, searchExact = false }: SearchUserParams): Promise<TypePaginatedList<UserRecord>> {
      const resultList = await UserModel.aggregate<{
         recordList: UserRecord[];
         countList: { count: number }[];
      }>([
         {
            $match: {
               ...(_id && { _id }),
               ...(!searchExact ? {
                  ...(name && { name: { $regex: escapeRegex(name), $options: 'i' } }),
                  ...(email && { name: { $regex: escapeRegex(email), $options: 'i' } }),
               } :
               {
                  ...(name && { name }),
                  ...(email && { email }),
               }),
            },
         },
         {
            $facet: {
               recordList: [
                  ...(skip ? [{ $skip: skip }] : []), 
                  ...(limit ? [{ $limit: limit }] : []), 
               ],
               countList: [{ $count: 'count' }],
            }
         }
      ]);
      const { recordList, countList } = resultList[0]!;

      return { list: recordList, count: countList[0]?.count ?? 0, firstItemIndex: skip ?? 0 }
   }



   @Protected
   async updateUser({ name, email, bio, imageReferenceId }: UpdateUserParams): Promise<UserRecord | null> {
      return UserModel.findByIdAndUpdate(
         this.clientId,
         { $set: { 
            ...(name && { name }), 
            ...(email && { email }), 
            ...(bio !== undefined && { bio }), 
            ...(imageReferenceId && { imageReferenceId }) } 
         },
         { new: true }
      ).lean<UserRecord>()
   }



}