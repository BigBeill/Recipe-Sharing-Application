import type { Types } from "mongoose";
import type { FriendshipRecord } from "../../externalResources/database/mongoose/schemas/friendship.schema";
import type { AuthorizationRepository } from "./authorization.repository";
import { UnauthorizedError } from "../../global/departingData/errorClasses";
import type { AuthenticationService } from "../authentication/application/authentication.service";

declare const reauthenticationProof: unique symbol;
export type ReauthenticationProof = { readonly [reauthenticationProof]: true };

export class AuthorizationService {
   private readonly repository: AuthorizationRepository;
   private readonly authenticationService: AuthenticationService

   private _clientId: Types.ObjectId | undefined;
   private _friendIdList: Types.ObjectId[] | undefined;
   private _reauthenticated: boolean;

   constructor({ clientId, authorizationRepository, authenticationService }: { 
      clientId: Types.ObjectId | undefined, 
      authorizationRepository: AuthorizationRepository,
      authenticationService: AuthenticationService,
   }) {
      this._clientId = clientId
      this.repository = authorizationRepository;
      this.authenticationService = authenticationService;
      this._reauthenticated = false;
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

   public get reauthenticated() { return this._reauthenticated; }

   async reauthenticate(password: string): Promise<ReauthenticationProof> {
      if (!this._reauthenticated) {
         await this.authenticationService.verifyPassword(this.requireClientId(), password);
         this._reauthenticated = true;
      }
      return {} as ReauthenticationProof;
   }
}