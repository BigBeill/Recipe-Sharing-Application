import { PaginatedListType } from "@/shared/shared.types";
import { RelationshipType, UserType } from "../domain/user.types";
import { createUserFormData } from "./user.utils";
import type {
   TypeUserApi,
   TypeUserServiceGetParam,
   TypeUserServiceProcessFriendRequestParams,
   TypeUserServiceSearchParams
} from "./user.api";

export function createUserService(api: TypeUserApi) {
   return {

      defineRelationship: (userId: string): Promise<RelationshipType> => {
         return api.defineRelationship(userId);
      },

      get: (userId: string, params?: TypeUserServiceGetParam) => {
         return api.get(userId, params);
      },

      processFriendRequest: (relationshipId: string, params: TypeUserServiceProcessFriendRequestParams) => {
         return api.processFriendRequest(relationshipId, params);
      },

      removeFriend: (relationshipId: string) => {
         return api.removeFriend(relationshipId);
      },

      search: (params: TypeUserServiceSearchParams): Promise<PaginatedListType<UserType>> => {
         return api.search(params);
      },

      sendFriendRequest: (userId: string) => {
         return api.sendFriendRequest(userId);
      },

      update: (user: UserType, image?: File): Promise<UserType> => {
         return api.update(createUserFormData(user, image));
      },
   }
}