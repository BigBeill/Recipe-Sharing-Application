import type { Types } from "mongoose";
import type { FriendshipRecord } from "../../externalResources/database/mongoose/schemas/friendship.schema";
import type { AuthorizationRepository } from "./authorization.repository";
import { UnauthorizedError } from "../../global/departingData/errorClasses";

export class AuthorizationService {
   private readonly repository: AuthorizationRepository;

   private _clientId: Types.ObjectId | undefined;
   private _friendIdList: Types.ObjectId[] | undefined;

   constructor({ authId, authorizationRepository }: { authId: Types.ObjectId | undefined, authorizationRepository: AuthorizationRepository }) {
      this._clientId = authId
      this.repository = authorizationRepository;
   }

   public get clientId() { return this._clientId; }

   public requireClientId() {
      if (!this._clientId) { throw new UnauthorizedError(); }
      else { return this._clientId }
   }

   private filterFriendshipsList(friendshipList: FriendshipRecord[]): Types.ObjectId[] {
      return friendshipList.flatMap((friendship) => { return friendship.friendIds.filter((id) => !id.equals(this._clientId)) });
   }

   public async getFriendIdList(): Promise<Types.ObjectId[]> {
      if (!this._friendIdList) {
         if (!this._clientId) { this._friendIdList = [] }
         else this._friendIdList = this.filterFriendshipsList(await this.repository.searchFriendship(this._clientId))
      }

      return this._friendIdList;
   }
}