import type { Types } from "mongoose";
import type { PaginatedListType } from "../../../common/api/apiResponse.types";
import { escapeRegex } from "../../../common/utils/filter";
import { FriendRequestModel, type FriendRequestRecord } from "../../../externalResources/database/mongoose/schemas/friendRequest.schema";
import { FriendshipModel, type FriendshipRecord } from "../../../externalResources/database/mongoose/schemas/friendship.schema";
import { UserModel, type UserRecord } from "../../../externalResources/database/mongoose/schemas/user.schema";
import type { TypeImage } from "../../images/domain/images.types";
import type { TypeRelationship } from "../domain/users.types";
import { NotFoundError } from "elysia";

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
   image?: TypeImage
}

export class UsersRepository {

   async createFriendRequest(userId: Types.ObjectId, targetId: Types.ObjectId): Promise<FriendRequestRecord> {
      const friendRequest = await FriendRequestModel.create({ senderId: userId, receiverId: targetId });
      return friendRequest.toObject();
   }



   async createFriendship(friendIds: [string, string]): Promise<FriendshipRecord> {
      const friendship = await FriendshipModel.create({ friendIds });
      return friendship.toObject();
   }



   async deleteFriendRequest(_id: Types.ObjectId) {
      await FriendRequestModel.deleteOne({ _id });
   }



   async deleteFriendship(_id: Types.ObjectId) {
      await FriendshipModel.deleteOne({ _id });
   }



   async deleteUser(_id: Types.ObjectId): Promise<void> {
      await UserModel.deleteOne({ _id });
   }



   async findRelationship(params: { ownerId: Types.ObjectId, targetId: Types.ObjectId, skipRequests?: boolean, skipFriendships?: boolean }): Promise<TypeRelationship | null> {
      const { ownerId, targetId, skipRequests = false, skipFriendships = false } = params;

      if (!skipRequests) {
         const friendRequestRecord = await FriendRequestModel.findOne({
            $or: [
               { senderId: ownerId, receiverId: targetId },
               { senderId: targetId, receiverId: ownerId },
            ],
         }).lean();

         if (friendRequestRecord !== null) {
            if (ownerId.equals(friendRequestRecord.senderId)) { return { _id: friendRequestRecord._id, ownerId, targetId, type: "requestSent" } }
            else { return { _id: friendRequestRecord._id, ownerId, targetId, type: "requestReceived" } } 
         }
      }

      if (!skipFriendships) {
         const friendship = await FriendshipModel.findOne({ friendIds: { $all: [ownerId, targetId] } }).lean();
         if (friendship != null) { return { _id: friendship._id, targetId, ownerId, type: 'friend' } }
      }

      return null;
   }



   async getFriendRequest(_id: Types.ObjectId): Promise<FriendRequestRecord> {
      const friendRequestRecord = await FriendRequestModel.findOne({ _id }).lean();
      if (!friendRequestRecord) { throw new NotFoundError(`Database could not find friend request with _id: ${ _id }`); }
      else { return friendRequestRecord; }
   }



   async getFriendship(_id: Types.ObjectId): Promise<FriendshipRecord> {
      const friendshipRecord = await FriendshipModel.findOne({ _id }).lean();
      if (!friendshipRecord) { throw new NotFoundError(`Database could not find friendship with _id: ${ _id }`) }
      else { return friendshipRecord; }
   }



   async getUser(_id: Types.ObjectId): Promise<UserRecord> {
      const user = await UserModel.findOne({_id }).lean<UserRecord>();
      if (!user) { throw new NotFoundError(`Database could not find user is _id: ${ _id } `); }
      else { return user; }
   }



   async searchFriendship(userId: Types.ObjectId): Promise<FriendshipRecord[]> {
      return FriendshipModel.find({ 
         friendIds: { $in: [ userId ]}, 
      }).lean<FriendshipRecord[]>();
   }



   async searchUser({ _id, name, email, skip, limit, searchExact = false }: SearchUserParams): Promise<PaginatedListType<UserRecord>> {
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



   async updateUser(_id: Types.ObjectId, { name, email, bio, image }: UpdateUserParams): Promise<UserRecord | null> {
      return UserModel.findByIdAndUpdate(
         _id,
         { $set: { 
            ...(name && { name }), 
            ...(email && { email }), 
            ...(bio !== undefined && { bio }), 
            ...(image && {image}) } 
         },
         { new: true }
      ).lean<UserRecord>()
   }



}