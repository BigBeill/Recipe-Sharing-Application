import { FriendRequestModel, type FriendRequestRecord } from "../../common/mongo-db/schemas/friendRequest.schema";
import { FriendshipModel, type FriendshipRecord } from "../../common/mongo-db/schemas/friendship.schema";
import { UserModel, type UserRecord } from "../../common/mongo-db/schemas/user.schema";
import type { ImageType } from "../images/images.types";
import type PaginationParams from "../../common/parameters/pagination.parameters";
import type { PaginatedListType } from "../../common/types/return.types";

interface GetFolderListParams extends PaginationParams{
   ownerId: string,
   parentId?: string, 
}

type GetFriendRequestParams = 
   | { _id: string, senderId?: string, receiverId?: string }
   | { _id?: string, senderId: string, receiverId: string }

type GetFriendshipParams = 
   | { _id: string, firstUserId?: string, secondUserId?: string }
   | { _id?: string, firstUserId: string, secondUserId: string }

interface GetUserListParams extends PaginationParams{
   _id?: string,
   name?: string,
}

interface UpdateUserParams {
   name?: string,
   email?: string,
   bio?: string,
   image?: ImageType
}

export class UsersRepository {

   async createFriendRequest(userId: string, targetId: string): Promise<FriendRequestRecord> {
      const friendRequest = await FriendRequestModel.create({ senderId: userId, receiverId: targetId });
      return friendRequest.toObject();
   }

   async createFriendship(friendIds: [string, string]): Promise<FriendshipRecord> {
      const friendship = await FriendshipModel.create({ friendIds });
      return friendship.toObject();
   }

   async deleteFriendRequest(_id: string) {
      await FriendRequestModel.deleteOne({ _id });
   }

   async deleteFriendship(_id: string) {
      await FriendshipModel.deleteOne({ _id });
   }

   async deleteUser(_id: string): Promise<void> {
      await UserModel.deleteOne({ _id });
   }

   async getExactUserList({name, email}: { name?: string, email?: string }): Promise<UserRecord[]> {
      const conditions: any[] = [];

      if (name) conditions.push({ name });
      if (email) conditions.push({ email });

      if (conditions.length === 0) { return []; }

      const userList = await UserModel.find({ $or: conditions }).lean();
      return userList;
   }

   async getFriendRequest({ _id, senderId, receiverId }: GetFriendRequestParams): Promise<FriendRequestRecord | null> {
      return FriendRequestModel.findOne({ ...(_id && { _id }), ...((senderId && receiverId) && { senderId, receiverId }) }).lean<FriendRequestRecord>();
   }

   async getFriendship({ _id, firstUserId, secondUserId }: GetFriendshipParams): Promise<FriendshipRecord | null> {
      return FriendshipModel.findOne({ 
         ...(_id && { _id }), 
         ...((firstUserId && secondUserId) && { friendIds: { $all: [firstUserId, secondUserId] } }),
      }).lean<FriendshipRecord>();
   }

   async getFriendshipList(userId: string): Promise<FriendshipRecord[]> {
      return FriendshipModel.find({ 
         friendIds: { $in: [ userId ]}, 
      }).lean<FriendshipRecord[]>();
   }

   async getUser(_id: string): Promise<UserRecord | null> {
      const user = UserModel.findOne({_id }).lean<UserRecord>();
      return user;
   }

   async searchUsers({ _id, name, skip, limit }: GetUserListParams): Promise<PaginatedListType<UserRecord>> {
      const resultList = await UserModel.aggregate<{
         recordList: UserRecord[];
         countList: { count: number }[];
      }>([
         {
            $match: {
               ...(_id && { _id }), 
               ...(name && { name }),
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

      return { list: recordList, count: countList[0]!.count, firstItemIndex: skip ?? 0 }
   }

   async updateUser(_id: string, { name, email, bio, image }: UpdateUserParams): Promise<UserRecord | null> {
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