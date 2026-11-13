import type { Types } from "mongoose";
import type { FriendshipRecord } from "../../externalResources/database/mongoose/schemas/friendship.schema";
import type { AuthorizationRepository } from "./authorization.repository";

export class AuthorizationService {
   private readonly repository: AuthorizationRepository;

   private _id: Types.ObjectId | undefined;
   private _friendIdList: Types.ObjectId[] | undefined;

   constructor({ authId, authorizationRepository }: { authId: Types.ObjectId | undefined, authorizationRepository: AuthorizationRepository }) {
      this._id = authId
      this.repository = authorizationRepository;
      
   }

   public get id() { return this._id; }

   private filterFriendshipsList(friendshipList: FriendshipRecord[]): Types.ObjectId[] {
      return friendshipList.flatMap((friendship) => { return friendship.friendIds.filter((id) => !id.equals(this._id)) });
   }

   public async getFriendIdList(): Promise<Types.ObjectId[]> {
      if (!this._friendIdList) {
         if (!this._id) { this._friendIdList = [] }
         else this._friendIdList = this.filterFriendshipsList(await this.repository.searchFriendship(this._id))
      }

      return this._friendIdList;
   }
}