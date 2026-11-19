import type { Types } from "mongoose";
import { escapeRegex } from "../../../common/utils/filter";
import { FriendRequestModel, type FriendRequestRecord } from "../../../externalResources/database/mongoose/schemas/friendRequest.schema";
import { FriendshipModel, type FriendshipRecord } from "../../../externalResources/database/mongoose/schemas/friendship.schema";
import { UserModel, type UserRecord } from "../../../externalResources/database/mongoose/schemas/user.schema";
import type { TypeUserDraft } from "../domain/users.types";
import type { TypePaginatedList } from "../../../common/domain/types.common";
import { NotFoundError } from "../../../global/departingData/errorClasses";
import { Protected } from "../../authorization/decorators/Protected";
import { AccessControlled } from "../../authorization/decorators/AccessControlled.function";

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

export class UsersRepository extends AccessControlled {



   async create(userDraft: TypeUserDraft): Promise<UserRecord> {
      const user = await UserModel.create(userDraft);
      const { passwordHash: _, email: __, __v, ...record } = user.toObject();
      return record;
   }



   @Protected
   async delete(): Promise<void> {
      const deleteResponse = await UserModel.deleteOne({ _id: this.authorization.requireClientId() });
      if (deleteResponse.deletedCount === 0) { throw new NotFoundError(); }
   }



   //! FUNCTION RETURNS CONFIDENTIAL INFORMATION THAT SHOULD NOT BE RETURNED TO THE FRONTEND (returned object contains email)
   async searchUserExact({ name, email }: { name?: string, email?: string }): Promise<UserRecord[]> {
      const conditions: any[] = [];

      if (name) { conditions.push({ name }); }
      if (email) { conditions.push({ email }); }

      if (conditions.length === 0) { return []; }

      const userList = await UserModel.find({ $or: conditions }).select('+email').lean();
      return userList;
   }



   async getUser(_id: Types.ObjectId): Promise<UserRecord> {
      const user = await UserModel.findOne({_id }).lean<UserRecord>();
      if (!user) { throw new NotFoundError(`friendship`); }
      else { return user; }
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
   async updatePassword(passwordHash: string): Promise<void> {
      const result = await UserModel.updateOne({ _id: this.authorization.requireClientId() }, { $set: { passwordHash } });
      if (result.matchedCount === 0) { throw new NotFoundError(); }
   }



   @Protected
   async updateUser({ name, email, bio, imageReferenceId }: UpdateUserParams): Promise<UserRecord | null> {
      return UserModel.findByIdAndUpdate(
         this.authorization.requireClientId(),
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