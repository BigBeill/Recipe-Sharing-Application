import type { Types } from "mongoose";
import { FriendshipModel, type FriendshipRecord } from "../../externalResources/database/mongoose/schemas/friendship.schema";

export class AuthorizationRepository {

   async searchFriendship(userId: Types.ObjectId): Promise<FriendshipRecord[]> {
      return FriendshipModel.find({ 
         friendIds: { $in: [ userId ]}, 
      }).lean<FriendshipRecord[]>();
   }

}