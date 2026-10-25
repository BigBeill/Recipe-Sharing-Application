import { PaginatedListType } from "@/shared/domain/shared.types";
import type {
   TypeUserApi,
   PayloadUserApiGet,
   PayloadUserApiProcessFriendRequest,
   PayloadUserApiSearch,
   PayloadUserApiUpdate,
} from "./user.api";
import { TypeRelationship, TypeUser } from "../domain/user.types";

export function createUserService(api: TypeUserApi) {
   return {

      defineRelationship: (userId: string): Promise<TypeRelationship> => {
         return api.defineRelationship(userId);
      },

      get: (userId: string, payload?: PayloadUserApiGet) => {
         return api.get(userId, payload);
      },

      processFriendRequest: (relationshipId: string, params: PayloadUserApiProcessFriendRequest) => {
         return api.processFriendRequest(relationshipId, params);
      },

      removeFriend: (relationshipId: string) => {
         return api.removeFriend(relationshipId);
      },

      search: (payload: PayloadUserApiSearch): Promise<PaginatedListType<TypeUser>> => {
         return api.search(payload);
      },

      sendFriendRequest: (userId: string) => {
         return api.sendFriendRequest(userId);
      },

      update: (userId: string, payload: PayloadUserApiUpdate): Promise<TypeUser> => {
         return api.update(userId, payload);
      },
   }
}